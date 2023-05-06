import type { AirtableBase } from "airtable/lib/airtable_base";
import { Category, PartnerRecordBase, getPartner } from "./partner";
import { LandscapeJson, getOrDownloadLogo } from "./utils";

export type AppRecord = {
  Twitter?: string;
  Website?: string;
  Project?: string;
  "App Name": string;
  Logo: string;
  Category: string;
};

export async function getAppAirtableJson(
  base: AirtableBase
): Promise<AppRecord[]> {
  const projects: AppRecord[] = [];

  const appRecords = await base("App Tasks")
    .select({
      view: "Alive",
      fields: [
        "Project Name Inline",
        "App Name",
        "Website",
        "Logo",
        "Category",
        "Twitter",
      ],
    })
    .all();

  if (appRecords != null) {
    for (const appRecord of appRecords) {
      const {
        Logo,
        "Project Name Inline": Project,
        ...rest
      } = appRecord._rawJson.fields;
      const logoFilename = await getOrDownloadLogo(
        appRecord._rawJson.fields["App Name"],
        Logo == null ? null : Logo[0]
      );

      const entry = {
        ...rest,
        Project,
        Logo: logoFilename,
      };
      if (Project != null && Project.length > 0) {
        entry.Project = Project[0];
      }
      projects.push(entry);
    }
  }
  return projects;
}

export async function updateAppYaml(
  base: AirtableBase,
  setYamlCategory: (categoryName: string, rows: AppRecord[]) => void
) {
  const rows = await getAppAirtableJson(base);
  console.log(rows);

  setYamlCategory("Projects", rows);
}

export function appAirtableToLandscapeJson(
  records: AppRecord[]
): LandscapeJson[] {
  const result: LandscapeJson[] = [];
  for (const record of records) {
    const yamlEntry: LandscapeJson = {
      item: null,
      name: record["App Name"],
      organization: {
        name: record["Project"] ?? record["App Name"],
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
