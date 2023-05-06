import type { AirtableBase } from "airtable/lib/airtable_base";
import { Category, PartnerRecordBase, getPartner } from "./partner";

export type EcosystemProjectRecord = Category;

export async function getEcosystemAirtableJson(
  base: AirtableBase
): Promise<Map<string, EcosystemProjectRecord>> {
  const ecosystemRecords = await base("Ecosystem Tasks")
    .select({
      view: "Done",
      fields: ["Project", "Category"],
    })
    .all();

  const ecosystemEntries = new Map<string, EcosystemProjectRecord>();
  if (ecosystemRecords != null) {
    for (const pepRecord of ecosystemRecords) {
      const project = pepRecord.get("Project");
      if (project != null) {
        ecosystemEntries.set(
          (project as string[])[0],
          pepRecord._rawJson.fields
        );
      }
    }
  }
  return ecosystemEntries;
}

export async function updateEcosystemYaml(
  base: AirtableBase,
  setYamlCategory: (categoryName: string, rows: PartnerRecordBase[]) => void
) {
  const rows = await getEcosystemAirtableJson(base);
  const result = await getPartner<EcosystemProjectRecord>(
    base,
    rows,
    "DAO/Guild/Community"
  );
  console.log(result);

  setYamlCategory("Ecosystem Partners", result);
}
