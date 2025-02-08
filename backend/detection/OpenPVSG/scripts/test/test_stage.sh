set -x

PARTITION=batch
JOB_NAME=psg
CONFIG=configs/mask2former/mask2former_r50_lsj_8x2_50e_coco-panoptic_custom_single_video_test.py
WORK_DIR=work_dirs/mask2former_r50_ips
CHECKPOINT=work_dirs/mask2former_r50_ips/epoch_8.pth
PORT=${PORT:-$((29500 + $RANDOM % 29))}
GPUS_PER_NODE=${GPUS_PER_NODE:-1}
CPUS_PER_TASK=${CPUS_PER_TASK:-5}
PY_ARGS=${@:5}

PYTHONPATH="/mnt/lustre/jkyang/CVPR23/openpvsg":$PYTHONPATH \
srun -p ${PARTITION} \
    --job-name=${JOB_NAME} \
    --gres=gpu:${GPUS_PER_NODE} \
    --ntasks-per-node=${GPUS_PER_NODE} \
    --cpus-per-task=${CPUS_PER_TASK} \
    --kill-on-bad-exit=1 \
    python -u tools/prepare_query_tube_ips.py ${CONFIG} ${CHECKPOINT} \
    --work-dir=${WORK_DIR} --split val --eval PQ






