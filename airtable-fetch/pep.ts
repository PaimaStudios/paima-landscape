import type { AirtableBase } from "airtable/lib/airtable_base";
import { Category, PartnerRecordBase, getPartner } from "./partner";

export type PepProjectRecord = Category;

export async function getPepAirtableJson(
  base: AirtableBase
): Promise<Map<string, PepProjectRecord>> {
  const pepRecords = await base("Professional Tasks")
    .select({
      view: "Done",
      fields: ["Project", "Category"],
    })
    .all();

  const pepEntries = new Map<string, PepProjectRecord>();
  if (pepRecords != null) {
    for (const pepRecord of pepRecords) {
      const project = pepRecord.get("Project");
      if (project != null) {
        pepEntries.set((project as string[])[0], pepRecord._rawJson.fields);
      }
    }
  }
  return pepEntries;
}

export async function updatePepYaml(
  base: AirtableBase,
  setYamlCategory: (categoryName: string, rows: PartnerRecordBase[]) => void
) {
  const rows = await getPepAirtableJson(base);
  const result = await getPartner<PepProjectRecord>(
    base,
    rows,
    "Professionals"
  );
  console.log(result);

  setYamlCategory("Paima Engine Professionals", result);
}
