#!/bin/sh
# Turns the frames captured by the docs spec (frontend/docs-output/frames.txt and frame-*.png,
# real screenshots of the app) into docs/images/demo.gif, 880 px wide, one shared palette.
#
# FFmpeg runs from the LinuxServer.io image (a third-party build, not an image published by the
# FFmpeg project), pinned by version and digest. It is only used here, never in the application
# images, and runs with no network, no capabilities, a read-only root filesystem, a non-root user
# and only the output folder mounted. ffmpeg is called directly: the image's s6 init needs root.
set -eu

IMAGE="lscr.io/linuxserver/ffmpeg:9.0.2-cli-ls90@sha256:66fa8e2351fb78f9dad2c59c946be2658edcc529339320da3f2cf788312368af"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$ROOT/frontend/docs-output"
[ -f "$WORK/frames.txt" ] || { echo "Capture the frames first: DOCS=1 npm run e2e (see README)." >&2; exit 1; }
# Docker Desktop on Windows needs a Windows path for the bind mount; elsewhere pwd is enough.
MOUNT="$(cd "$WORK" && (pwd -W 2>/dev/null || pwd))"
export MSYS_NO_PATHCONV=1

docker run --rm --network none --cap-drop ALL --security-opt no-new-privileges \
  --read-only --tmpfs /tmp --user "$(id -u):$(id -g)" \
  --entrypoint ffmpeg -v "$MOUNT:/work" -w /work "$IMAGE" -hide_banner -loglevel error -y \
  -f concat -i frames.txt -filter_complex \
  "fps=10,scale=880:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=160:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle" \
  demo.gif

mkdir -p "$ROOT/docs/images"
cp "$WORK/demo.gif" "$ROOT/docs/images/demo.gif"
ls -l "$ROOT/docs/images/demo.gif"
