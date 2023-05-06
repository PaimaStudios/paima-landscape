import Airtable from "airtable";
import fs from "fs";
import YAML from "yaml";
import { groupBy } from "lodash";
import { updatePepYaml } from "./pep";
import { PartnerRecordBase, partnerAirtableToLandscapeJson } from "./partner";
import { updateEcosystemYaml } from "./ecosystem";
import { AppRecord, appAirtableToLandscapeJson, updateAppYaml } from "./app";

const LANDSCAPE_FILE = "../landscape.yml";

const base = Airtable.base("app3IEeIwae4pd0At");

function setYamlCategory<T>(
  yamlObj: any,
  categoryName: string,
  rows: T[],
  toYaml: (rows: T[]) => any
) {
  const pepYaml = yamlObj.landscape.find(
    (category: any) => category.name === categoryName
  );
  if (pepYaml == null) {
    console.error("Missing category: " + categoryName);
    process.exit(1);
  }

  pepYaml.subcategories = [];

  const airtableByCategory = groupBy(rows, "Category");
  for (const [category, entries] of Object.entries(airtableByCategory)) {
    const categoryLandscapeJson = toYaml(entries);
    pepYaml.subcategories.push({
      subcategory: null,
      name: category,
      items: categoryLandscapeJson,
    });
  }
}

async function updateYaml() {
  const yamlData = fs.readFileSync(LANDSCAPE_FILE, "utf8");
  const yamlObj: any = YAML.parse(yamlData);

  {
    const setCategory = (categoryName: string, rows: PartnerRecordBase[]) =>
      setYamlCategory<PartnerRecordBase>(
        yamlObj,
        categoryName,
        rows,
        partnerAirtableToLandscapeJson
      );
    await updatePepYaml(base, setCategory);
    await updateEcosystemYaml(base, setCategory);
  }
  {
    const setCategory = (categoryName: string, rows: AppRecord[]) =>
      setYamlCategory<AppRecord>(
        yamlObj,
        categoryName,
        rows,
        appAirtableToLandscapeJson
      );
    await updateAppYaml(base, setCategory);
  }
  fs.writeFileSync(LANDSCAPE_FILE, YAML.stringify(yamlObj, { nullStr: "" }));
}

updateYaml();
