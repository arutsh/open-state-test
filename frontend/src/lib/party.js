const BUCKET_LABELS = {
  dem: "Democratic",
  rep: "Republican",
  ind: "Independent / Other",
  vacant: "Vacant",
};

export function bucketOf(party) {
  if (party === "Democratic") return "dem";
  if (party === "Republican") return "rep";
  if (party === "Vacant") return "vacant";
  return "ind";
}

export function bucketLabel(bucket) {
  return BUCKET_LABELS[bucket] || bucket;
}
