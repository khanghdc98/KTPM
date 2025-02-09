dataset_type = 'PVSGVideoDataset'
data_root = './data/'

img_norm_cfg = dict(
    mean=[123.675, 116.28, 103.53], std=[58.395, 57.12, 57.375], to_rgb=False
)
crop_size = (360, 480)
# The kitti dataset contains 1226 x 370 and 1241 x 376
train_pipeline = [
    dict(type='LoadMultiImagesDirect'),
    dict(type='LoadMultiAnnotationsDirect'),
    dict(type='SeqResize', img_scale=(360, 480), keep_ratio=False),
    dict(type='SeqRandomFlip', flip_ratio=0.5),
    dict(type='SeqRandomCrop', crop_size=crop_size, share_params=True),
    dict(type='SeqNormalize', **img_norm_cfg),
    dict(type='SeqPad', size_divisor=32),
    dict(
        type='VideoCollect',
        keys=['img', 'gt_bboxes', 'gt_labels', 'gt_masks', 'gt_semantic_seg', 'gt_instance_ids']),
    dict(type='ConcatVideoReferences'),
    dict(type='SeqDefaultFormatBundle', ref_prefix='ref'),
]

test_pipeline = [
    dict(type='LoadMultiImagesDirect'),
    dict(type='SeqNormalize', **img_norm_cfg),
    dict(type='SeqPad', size_divisor=32),
    dict(type='VideoCollect', keys=['img']),
    dict(type='ConcatVideoReferences'),
    dict(type='SeqDefaultFormatBundle', ref_prefix='ref'),
]

data = dict(
    samples_per_gpu=1,
    workers_per_gpu=2,
    train=dict(
        type='RepeatDataset',
        times=4,
        dataset=dict(
            type=dataset_type,
            data_root=data_root,
            split='train',
            ref_sample_mode='sequence',
            ref_seq_index=[0, 1], # 与cur_img的相对index
            test_mode=False,
            pipeline=train_pipeline,
        )
    ),
    val=dict(
        type=dataset_type,
        data_root=data_root,
        split='val',
        ref_sample_mode='sequence',
        ref_seq_index=[0, 1],
        test_mode=True,
        pipeline=test_pipeline,
    ),
)

evaluation = dict(interval=5000000)
