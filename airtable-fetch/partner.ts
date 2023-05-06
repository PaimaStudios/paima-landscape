import type { AirtableBase } from "airtable/lib/airtable_base";
import { LandscapeJson, getOrDownloadLogo } from "./utils";

export type Category = {
  Category: string;
};

export type PartnerRecordBase = {
  Twitter?: string;
  Website?: string;
  // Description?: string,
  "Project Name": string;
  Logo: string;
  Category: string;
};

export async function getPartner<T>(
  base: AirtableBase,
  filter: Map<string, T>,
  view: string
): Promise<(PartnerRecordBase & T)[]> {
  const projects: (PartnerRecordBase & T)[] = [];

  const partnerRecords = await base("Partner Directory")
    .select({
      view,
      fields: [
        "Project Name",
        // "Description",
        "Website",
        "Twitter",
        "Logo",
      ],
    })
    .all();
  if (partnerRecords != null) {
    for (const partnerRecord of partnerRecords) {
      const extraRows = filter.get(partnerRecord.id);

      // skip rows not in the filter
      if (extraRows == null) {
        continue;
      }
      const { Logo, ...rest } = partnerRecord._rawJson.fields;
      const logoFilename = await getOrDownloadLogo(
        partnerRecord._rawJson.fields["Project Name"],
        Logo == null ? null : Logo[0]
      );
      projects.push({
        ...rest,
        Logo: logoFilename,
        ...extraRows,
      });
    }
  }

  return projects;
}

export function partnerAirtableToLandscapeJson(
  records: PartnerRecordBase[]
): LandscapeJson[] {
  const result: LandscapeJson[] = [];
  for (const record of records) {
    const yamlEntry: LandscapeJson = {
      item: null,
      name: record["Project Name"],
      organization: {
        name: record["Project Name"],
      },
      logo: record.Logo,
    };
    if (record["Website"] != null)
      yamlEntry["homepage_url"] = record["Website"];
    if (record["Twitter"] != null) yamlEntry["twitter"] = record["Twitter"];

    result.push(yamlEntry);
  }
  return result;
}
