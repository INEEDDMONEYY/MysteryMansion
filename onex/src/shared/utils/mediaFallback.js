// Swaps a broken primary media src (e.g. a Cloudinary asset that was taken
// down/flagged) to its redundant backup URL, if one exists. Guards against
// retry loops if the backup itself also fails to load.
export function handleMediaError(backupUrl) {
  return (event) => {
    if (!backupUrl || event.target.dataset.usedBackup === "1") return;
    event.target.dataset.usedBackup = "1";
    event.target.src = backupUrl;
  };
}
