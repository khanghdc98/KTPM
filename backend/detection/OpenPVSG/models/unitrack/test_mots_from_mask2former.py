import os
import sys
import pdb
import cv2
import pickle
import yaml
import logging
import argparse
import os.path as osp
import pycocotools.mask as mask_utils

import numpy as np
import torch
from torchvision.transforms import transforms as T

sys.path[0] = os.getcwd()
from models.unitrack.utils.log import logger
from models.unitrack.utils.meter import Timer
from models.unitrack.data.single_video import LoadOutputsFromMask2Former

from models.unitrack.eval import trackeval
from models.unitrack.eval.mots.MOTSVisualization import MOTSVisualizer
from models.unitrack.utils import visualize as vis
from models.unitrack.utils import io as io
from models.unitrack.mask import MaskAssociationTracker
from models.unitrack.basetrack import BaseTrack


def eval_seq(data_cfg,
             tracker_cfg,
             outputs,
             classes,
             save_root,
             return_results=False):
    save_dir = osp.join(save_root, 'qualititive')
    io.mkdir_if_missing(save_dir)
    dataloader = LoadOutputsFromMask2Former(data_cfg=data_cfg,
                                            outputs=outputs,
                                            tracker_cfg=tracker_cfg,
                                            classes=classes)
    # reset tracker counting for each video
    BaseTrack.reset_count()
    tracker = MaskAssociationTracker(tracker_cfg)
    timer = Timer()
    results = []
    for frame_id, (img, obs, img0, _, query_feats) in enumerate(dataloader):
        if frame_id % 20 == 0:
            logger.info('Processing frame {} ({:.2f} fps)'.format(
                frame_id, 1. / max(1e-5, timer.average_time)))
        online_tlwhs = []
        online_ids = []
        online_masks = []
        if len(obs) == 0:  # nothing in this frame!
            results.append((frame_id + 1, [], [], []))
        else:
            # run tracking
            timer.tic()
            online_targets, _ = tracker.update(img, img0, obs, query_feats, 0)
            for t in online_targets:
                tlwh = t.tlwh * tracker_cfg.common.down_factor
                tid = t.track_id
                mask = t.mask.astype(np.uint8)
                mask = mask_utils.encode(np.asfortranarray(mask))
                mask['counts'] = mask['counts'].decode('ascii')
                mask['class_id'] = t.cls_id
                online_tlwhs.append(tlwh)
                online_ids.append(tid)
                online_masks.append(mask)
            timer.toc()
            results.append(
                (frame_id + 1, online_tlwhs, online_masks, online_ids))
        if save_dir is not None:
            online_im = vis.plot_tracking(img0,
                                          online_masks,
                                          online_ids,
                                          frame_id=frame_id)
            cv2.imwrite(os.path.join(save_dir, '{:04d}.png'.format(frame_id)),
                        online_im)
            
            bbox_dir = osp.join(save_root, 'bboxes')
            io.mkdir_if_missing(bbox_dir)
            with open(os.path.join(bbox_dir, '{:04d}.txt'.format(frame_id)), 'w') as f:
                f.write(str(online_tlwhs))
            f.close()

    result_filename = osp.join(save_root, 'quantitive/masks.txt')
    io.write_mots_results(result_filename, results)

    query_feat_tubes = tracker.query_feat_tubes
    query_feat_tubes = [
        query_feat_tube.complete_empty_postfix(frame_id)
        for query_feat_tube in query_feat_tubes
    ]

    qf_results_filename = osp.join(save_root, 'query_feats.pickle')
    print('Writing results to {}'.format(qf_results_filename), flush=True)
    with open(qf_results_filename, 'wb') as f:
        pickle.dump(query_feat_tubes, f)

    if return_results:
        return results, query_feat_tubes