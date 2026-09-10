export function postalFromId(id) {
  const match = /(?:state|district|territory):([a-z]{2})/i.exec(id || "");
  if (match) return match[1].toUpperCase();
  return (id || "").slice(0, 2).toUpperCase();
}

export function chamberLabel(chamberKey) {
  if (chamberKey === "upper") return "Upper chamber";
  if (chamberKey === "lower") return "Lower chamber";
  if (chamberKey === "legislature") return "Legislature";
  return chamberKey || "Unspecified";
}
