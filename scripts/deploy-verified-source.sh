#!/usr/bin/env bash
set -euo pipefail

stamp="$1"
source_archive="$2"
evidence_archive="$3"
source_commit="$4"
expected_source_sha="$5"
expected_evidence_sha="$6"

if [[ ! "$source_commit" =~ ^[a-f0-9]{40}$ ]]; then
  echo "Invalid source commit" >&2
  exit 2
fi
if [[ ! "$expected_source_sha" =~ ^[a-f0-9]{64}$ ]] || [[ ! "$expected_evidence_sha" =~ ^[a-f0-9]{64}$ ]]; then
  echo "Invalid archive digest" >&2
  exit 2
fi

actual_source_sha="$(sha256sum "/tmp/$source_archive" | cut -d' ' -f1)"
actual_evidence_sha="$(sha256sum "/tmp/$evidence_archive" | cut -d' ' -f1)"
if [[ "$actual_source_sha" != "$expected_source_sha" ]] || [[ "$actual_evidence_sha" != "$expected_evidence_sha" ]]; then
  echo "Archive digest mismatch" >&2
  exit 3
fi
archive_commit="$(gzip -cd "/tmp/$source_archive" | { git get-tar-commit-id; cat >/dev/null; })"
if [[ "$archive_commit" != "$source_commit" ]]; then
  echo "Source archive commit does not match declared release commit" >&2
  exit 3
fi

release="/srv/release-witness/releases/$stamp"
previous_release="$(readlink -f /srv/release-witness/current 2>/dev/null || true)"
previous_config="$(sudo cat /etc/systemd/system/release-witness.service.d/release.conf 2>/dev/null || true)"
restore_previous() {
  if [[ -n "$previous_release" && -d "$previous_release" ]]; then
    sudo ln -sfn "$previous_release" /srv/release-witness/current.new
    sudo mv -Tf /srv/release-witness/current.new /srv/release-witness/current
  fi
  if [[ -n "$previous_config" ]]; then
    printf '%s\n' "$previous_config" | sudo tee /etc/systemd/system/release-witness.service.d/release.conf >/dev/null
  else
    sudo rm -f /etc/systemd/system/release-witness.service.d/release.conf
  fi
  sudo systemctl daemon-reload
  sudo systemctl restart release-witness
}
sudo install -d -o releasewitness -g releasewitness "$release"
sudo -u releasewitness tar -xzf "/tmp/$source_archive" -C "$release"
sudo -u releasewitness tar -xzf "/tmp/$evidence_archive" -C /srv/release-witness/shared/artifacts
sudo -u releasewitness ln -s ../../shared/artifacts "$release/artifacts"
cd "$release"
sudo -u releasewitness npm ci --omit=dev
sudo install -d /etc/systemd/system/release-witness.service.d
printf '[Service]\nEnvironment=RELEASE_COMMIT=%s\nEnvironment=RELEASE_ARCHIVE_SHA256=%s\n' "$source_commit" "$expected_source_sha" | sudo tee /etc/systemd/system/release-witness.service.d/release.conf >/dev/null
sudo systemctl daemon-reload
sudo ln -sfn "$release" /srv/release-witness/current.new
sudo mv -Tf /srv/release-witness/current.new /srv/release-witness/current
if ! sudo systemctl restart release-witness; then
  echo "Release restart failed; restoring the previous release." >&2
  restore_previous
  exit 4
fi

if ! sudo -u releasewitness node scripts/verify-deployment.mjs http://127.0.0.1:4317 "$source_commit" "$expected_source_sha"; then
  echo "Release verification failed; restoring the previous release." >&2
  restore_previous
  exit 4
fi

sudo systemctl is-active release-witness
sudo systemctl is-active caddy
readlink -f /srv/release-witness/current
