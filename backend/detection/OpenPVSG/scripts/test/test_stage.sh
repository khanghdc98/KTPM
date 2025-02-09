set -x

PARTITION=batch
JOB_NAME=psg
CONFIG=./OpenPVSG/configs/mask2former/mask2former_r50_lsj_8x2_50e_coco-panoptic_custom_single_video_test.py
WORK_DIR=./OpenPVSG/work_dirs/mask2former_r50_ips
CHECKPOINT=./OpenPVSG/work_dirs/mask2former_r50_ips/epoch_8.pth
PORT=${PORT:-$((29500 + $RANDOM % 29))}
GPUS_PER_NODE=${GPUS_PER_NODE:-1}
CPUS_PER_TASK=${CPUS_PER_TASK:-3}
PY_ARGS=${@:5}

PYTHONPATH="/mnt/lustre/jkyang/CVPR23/openpvsg":$PYTHONPATH \
srun -p ${PARTITION} \
    --job-name=${JOB_NAME} \
    --nodelist=phoenix3 \
    --gres=gpu:${GPUS_PER_NODE} \
    --ntasks-per-node=${GPUS_PER_NODE} \
    --cpus-per-task=${CPUS_PER_TASK} \
    --kill-on-bad-exit=1 \
    python -u ./OpenPVSG/tools/prepare_query_tube_ips.py ${CONFIG} ${CHECKPOINT} \
    --work-dir=${WORK_DIR} --split val --eval PQ --video-name 0be30efe-9d71-4698-8304-f1d441aeea58_1






