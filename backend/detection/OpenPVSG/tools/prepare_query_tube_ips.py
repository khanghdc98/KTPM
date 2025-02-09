# Copyright (c) OpenMMLab. All rights reserved.
# Copy and modified from mmdet@3b72b12
# No other change to mmdet@3b72b12 except for:
# HY : custom import
import argparse
import os
import os.path as osp
import time
import pickle
import warnings
import json

import mmcv
import torch
from mmcv import Config, DictAction
from mmcv.cnn import fuse_conv_bn
from mmcv.runner import (get_dist_info, init_dist, load_checkpoint,
                         wrap_fp16_model)

from mmdet.apis import multi_gpu_test, single_gpu_test
from mmdet.datasets import (build_dataloader, replace_ImageToTensor)
from mmdet.models import build_detector
from mmdet.utils import (build_ddp, build_dp, compat_cfg, get_device,
                         replace_cfg_vals, setup_multi_processes,
                         update_data_root)

import sys
sys.path.append('..')
sys.path.append('OpenPVSG')
from datasets.datasets.builder import build_dataset
import models  # noqa: F401
import datasets  # noqa: F401
from models.unitrack.test_mots_from_mask2former import eval_seq

from pprint import pprint


def parse_args():
    parser = argparse.ArgumentParser(
        description='MMDet test (and eval) a model')
    parser.add_argument('config', help='test config file path')
    parser.add_argument('checkpoint', help='checkpoint file')
    parser.add_argument(
        '--video-name',
        help='video name for testing',
        type=str)
    parser.add_argument(
        '--work-dir',
        help='the directory to save the file containing evaluation metrics')
    parser.add_argument('--out', help='output result file in pickle format')
    parser.add_argument('--split', help='generate train or val set')
    parser.add_argument(
        '--fuse-conv-bn',
        action='store_true',
        help='Whether to fuse conv and bn, this will slightly increase'
        'the inference speed')
    parser.add_argument(
        '--gpu-ids',
        type=int,
        nargs='+',
        help='(Deprecated, please use --gpu-id) ids of gpus to use '
        '(only applicable to non-distributed training)')
    parser.add_argument('--gpu-id',
                        type=int,
                        default=0,
                        help='id of gpu to use '
                        '(only applicable to non-distributed testing)')
    parser.add_argument(
        '--format-only',
        action='store_true',
        help='Format the output results without perform evaluation. It is'
        'useful when you want to format the result to a specific format and '
        'submit it to the test server')
    parser.add_argument(
        '--eval',
        type=str,
        nargs='+',
        help='evaluation metrics, which depends on the dataset, e.g., "bbox",'
        ' "segm", "proposal" for COCO, and "mAP", "recall" for PASCAL VOC')
    parser.add_argument('--show', action='store_true', help='show results')
    parser.add_argument('--show-dir',
                        help='directory where painted images will be saved')
    parser.add_argument('--show-score-thr',
                        type=float,
                        default=0.3,
                        help='score threshold (default: 0.3)')
    parser.add_argument('--gpu-collect',
                        action='store_true',
                        help='whether to use gpu to collect results.')
    parser.add_argument(
        '--tmpdir',
        help='tmp directory used for collecting results from multiple '
        'workers, available when gpu-collect is not specified')
    parser.add_argument(
        '--cfg-options',
        nargs='+',
        action=DictAction,
        help='override some settings in the used config, the key-value pair '
        'in xxx=yyy format will be merged into config file. If the value to '
        'be overwritten is a list, it should be like key="[a,b]" or key=a,b '
        'It also allows nested list/tuple values, e.g. key="[(a,b),(c,d)]" '
        'Note that the quotation marks are necessary and that no white space '
        'is allowed.')
    parser.add_argument(
        '--options',
        nargs='+',
        action=DictAction,
        help='custom options for evaluation, the key-value pair in xxx=yyy '
        'format will be kwargs for dataset.evaluate() function (deprecate), '
        'change to --eval-options instead.')
    parser.add_argument(
        '--eval-options',
        nargs='+',
        action=DictAction,
        help='custom options for evaluation, the key-value pair in xxx=yyy '
        'format will be kwargs for dataset.evaluate() function')
    parser.add_argument('--launcher',
                        choices=['none', 'pytorch', 'slurm', 'mpi'],
                        default='none',
                        help='job launcher')
    parser.add_argument('--local_rank', type=int, default=0)
    args = parser.parse_args()
    if 'LOCAL_RANK' not in os.environ:
        os.environ['LOCAL_RANK'] = str(args.local_rank)

    if args.options and args.eval_options:
        raise ValueError(
            '--options and --eval-options cannot be both '
            'specified, --options is deprecated in favor of --eval-options')
    if args.options:
        warnings.warn('--options is deprecated in favor of --eval-options')
        args.eval_options = args.options
    return args


def main():
    args = parse_args()
    print(f"args: {args}")

    if args.eval and args.format_only:
        raise ValueError('--eval and --format_only cannot be both specified')

    if args.out is not None and not args.out.endswith(('.pkl', '.pickle')):
        raise ValueError('The output file must be a pkl file.')

    cfg = Config.fromfile(args.config)
    # print(f"cfg: {cfg}")

    # replace the ${key} with the value of cfg.key
    cfg = replace_cfg_vals(cfg)
    # print("cfg: ", cfg)

    # update data root according to MMDET_DATASETS
    update_data_root(cfg)

    if args.cfg_options is not None:
        cfg.merge_from_dict(args.cfg_options)

    cfg = compat_cfg(cfg)
    # print("cfg: ", cfg)

    # set multi-process settings
    setup_multi_processes(cfg)

    # set cudnn_benchmark
    if cfg.get('cudnn_benchmark', False):
        torch.backends.cudnn.benchmark = True

    if 'pretrained' in cfg.model:
        cfg.model.pretrained = None
    elif 'init_cfg' in cfg.model.backbone:
        cfg.model.backbone.init_cfg = None

    if cfg.model.get('neck'):
        if isinstance(cfg.model.neck, list):
            for neck_cfg in cfg.model.neck:
                if neck_cfg.get('rfp_backbone'):
                    if neck_cfg.rfp_backbone.get('pretrained'):
                        neck_cfg.rfp_backbone.pretrained = None
        elif cfg.model.neck.get('rfp_backbone'):
            if cfg.model.neck.rfp_backbone.get('pretrained'):
                cfg.model.neck.rfp_backbone.pretrained = None

    if args.gpu_ids is not None:
        cfg.gpu_ids = args.gpu_ids[0:1]
        warnings.warn('`--gpu-ids` is deprecated, please use `--gpu-id`. '
                      'Because we only support single GPU mode in '
                      'non-distributed testing. Use the first GPU '
                      'in `gpu_ids` now.')
    else:
        cfg.gpu_ids = [args.gpu_id]

    cfg.device = get_device()
    # init distributed env first, since logger depends on the dist info.
    if args.launcher == 'none':
        distributed = False
    else:
        distributed = True
        init_dist(args.launcher, **cfg.dist_params)

    test_dataloader_default_args = dict(samples_per_gpu=1,
                                        workers_per_gpu=2,
                                        dist=distributed,
                                        shuffle=False)

    # in case the test dataset is concatenated
    if isinstance(cfg.data.test, dict):
        cfg.data.test.test_mode = True
        if cfg.data.test_dataloader.get('samples_per_gpu', 1) > 1:
            cfg.data.test.pipeline = replace_ImageToTensor(
                cfg.data.test.pipeline)
    elif isinstance(cfg.data.test, list):
        for ds_cfg in cfg.data.test:
            ds_cfg.test_mode = True
        if cfg.data.test_dataloader.get('samples_per_gpu', 1) > 1:
            for ds_cfg in cfg.data.test:
                ds_cfg.pipeline = replace_ImageToTensor(ds_cfg.pipeline)

    test_loader_cfg = {
        **test_dataloader_default_args,
        **cfg.data.get('test_dataloader', {})
    }

    # build the model and load checkpoint
    cfg.model.train_cfg = None
    model = build_detector(cfg.model, test_cfg=cfg.get('test_cfg'))
    fp16_cfg = cfg.get('fp16', None)
    if fp16_cfg is not None:
        wrap_fp16_model(model)
    checkpoint = load_checkpoint(model, args.checkpoint, map_location='cpu')
    if args.fuse_conv_bn:
        model = fuse_conv_bn(model)

    if not distributed:
        model = build_dp(model, cfg.device, device_ids=cfg.gpu_ids)
    else:
        model = build_ddp(model,
                          cfg.device,
                          device_ids=[int(os.environ['LOCAL_RANK'])],
                          broadcast_buffers=False)

    # add cfg.tracker_cfg, which is not loaded but saved in a config file
    cfg.tracker_cfg = Config.fromfile("./OpenPVSG/configs/unitrack/imagenet_resnet50_s3_womotion_timecycle.py")['tracker_cfg']
    # pprint(cfg.tracker_cfg)

    split = args.split
    pvsg_json = './OpenPVSG/data/pvsg.json'
    save_dir = args.work_dir
    with open(pvsg_json, 'r') as f:
        anno = json.load(f)
    video_names = []
    # for data_source in ['vidor', 'epic_kitchen', 'ego4d']:
    for data_source in ['ego4d']:
        print(f"data source: {data_source}")
        print(f"split: {split}")
        for video_id in anno['split'][data_source][split]:
            video_names.append(video_id)
    for video_name in video_names[:1]:
        print('Testing for video {}'.format(video_name), flush=True)
        cfg.data.test.video_name = video_name
        dataset_single_video = build_dataset(cfg.data.test)
        data_loader = build_dataloader(dataset_single_video, **test_loader_cfg)
        model.CLASSES = dataset_single_video.CLASSES
        if not distributed:
            outputs = single_gpu_test(model, data_loader, args.show,
                                      args.show_dir, args.show_score_thr)
        else:
            outputs = multi_gpu_test(
                model, data_loader, args.tmpdir, args.gpu_collect
                or cfg.evaluation.get('gpu_collect', False))

        save_root = osp.join(save_dir, video_name)
        if not osp.exists(save_root):
            os.makedirs(save_root)

        eval_seq(data_cfg=cfg.data.test,
                 tracker_cfg=cfg.tracker_cfg,
                 outputs=outputs,
                 classes=dataset_single_video.CLASSES,
                 save_root=save_root)


def get_detections():
    args = parse_args()
    print(f"args: {args}")

    if args.eval and args.format_only:
        raise ValueError('--eval and --format_only cannot be both specified')

    if args.out is not None and not args.out.endswith(('.pkl', '.pickle')):
        raise ValueError('The output file must be a pkl file.')

    cfg = Config.fromfile(args.config)
    # print(f"cfg: {cfg}")

    # replace the ${key} with the value of cfg.key
    cfg = replace_cfg_vals(cfg)
    # print("cfg: ", cfg)

    # update data root according to MMDET_DATASETS
    update_data_root(cfg)

    if args.cfg_options is not None:
        cfg.merge_from_dict(args.cfg_options)

    cfg = compat_cfg(cfg)
    # print("cfg: ", cfg)

    # set multi-process settings
    setup_multi_processes(cfg)

    # set cudnn_benchmark
    if cfg.get('cudnn_benchmark', False):
        torch.backends.cudnn.benchmark = True

    if 'pretrained' in cfg.model:
        cfg.model.pretrained = None
    elif 'init_cfg' in cfg.model.backbone:
        cfg.model.backbone.init_cfg = None

    if cfg.model.get('neck'):
        if isinstance(cfg.model.neck, list):
            for neck_cfg in cfg.model.neck:
                if neck_cfg.get('rfp_backbone'):
                    if neck_cfg.rfp_backbone.get('pretrained'):
                        neck_cfg.rfp_backbone.pretrained = None
        elif cfg.model.neck.get('rfp_backbone'):
            if cfg.model.neck.rfp_backbone.get('pretrained'):
                cfg.model.neck.rfp_backbone.pretrained = None

    if args.gpu_ids is not None:
        cfg.gpu_ids = args.gpu_ids[0:1]
        warnings.warn('`--gpu-ids` is deprecated, please use `--gpu-id`. '
                      'Because we only support single GPU mode in '
                      'non-distributed testing. Use the first GPU '
                      'in `gpu_ids` now.')
    else:
        cfg.gpu_ids = [args.gpu_id]

    cfg.device = get_device()
    # init distributed env first, since logger depends on the dist info.
    if args.launcher == 'none':
        distributed = False
    else:
        distributed = True
        init_dist(args.launcher, **cfg.dist_params)

    test_dataloader_default_args = dict(samples_per_gpu=1,
                                        workers_per_gpu=2,
                                        dist=distributed,
                                        shuffle=False)

    # in case the test dataset is concatenated
    if isinstance(cfg.data.test, dict):
        cfg.data.test.test_mode = True
        if cfg.data.test_dataloader.get('samples_per_gpu', 1) > 1:
            cfg.data.test.pipeline = replace_ImageToTensor(
                cfg.data.test.pipeline)
    elif isinstance(cfg.data.test, list):
        for ds_cfg in cfg.data.test:
            ds_cfg.test_mode = True
        if cfg.data.test_dataloader.get('samples_per_gpu', 1) > 1:
            for ds_cfg in cfg.data.test:
                ds_cfg.pipeline = replace_ImageToTensor(ds_cfg.pipeline)

    test_loader_cfg = {
        **test_dataloader_default_args,
        **cfg.data.get('test_dataloader', {})
    }

    # build the model and load checkpoint
    cfg.model.train_cfg = None
    model = build_detector(cfg.model, test_cfg=cfg.get('test_cfg'))
    fp16_cfg = cfg.get('fp16', None)
    if fp16_cfg is not None:
        wrap_fp16_model(model)
    checkpoint = load_checkpoint(model, args.checkpoint, map_location='cpu')
    if args.fuse_conv_bn:
        model = fuse_conv_bn(model)

    if not distributed:
        model = build_dp(model, cfg.device, device_ids=cfg.gpu_ids)
    else:
        model = build_ddp(model,
                          cfg.device,
                          device_ids=[int(os.environ['LOCAL_RANK'])],
                          broadcast_buffers=False)

    # add cfg.tracker_cfg, which is not loaded but saved in a config file
    cfg.tracker_cfg = Config.fromfile("./OpenPVSG/configs/unitrack/imagenet_resnet50_s3_womotion_timecycle.py")['tracker_cfg']
    # pprint(cfg.tracker_cfg)

    split = args.split
    pvsg_json = './OpenPVSG/data/pvsg.json'
    save_dir = args.work_dir
    with open(pvsg_json, 'r') as f:
        anno = json.load(f)
    # video_names = []
    # # for data_source in ['vidor', 'epic_kitchen', 'ego4d']:
    # for data_source in ['ego4d']:
    #     print(f"data source: {data_source}")
    #     print(f"split: {split}")
    #     for video_id in anno['split'][data_source][split]:
    #         video_names.append(video_id)
    video_names = [args.video_name]
    for video_name in video_names:
        print('Testing for video {}'.format(video_name), flush=True)
        cfg.data.test.video_name = video_name
        dataset_single_video = build_dataset(cfg.data.test)
        data_loader = build_dataloader(dataset_single_video, **test_loader_cfg)
        model.CLASSES = dataset_single_video.CLASSES
        if not distributed:
            outputs = single_gpu_test(model, data_loader, args.show,
                                      args.show_dir, args.show_score_thr)
        else:
            outputs = multi_gpu_test(
                model, data_loader, args.tmpdir, args.gpu_collect
                or cfg.evaluation.get('gpu_collect', False))

        save_root = osp.join(save_dir, video_name)
        if not osp.exists(save_root):
            os.makedirs(save_root)

        eval_seq(data_cfg=cfg.data.test,
                 tracker_cfg=cfg.tracker_cfg,
                 outputs=outputs,
                 classes=dataset_single_video.CLASSES,
                 save_root=save_root)


if __name__ == '__main__':
    get_detections()
