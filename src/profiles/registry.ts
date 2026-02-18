import fs from "node:fs/promises";
import path from "node:path";
import type { MigrationProfile } from "./types.js";
import { vue2ToVue3Profile } from "./vue2-to-vue3.js";
import { reactClassToHooksProfile } from "./react-class-to-hooks.js";
import { webpackToViteProfile } from "./webpack-to-vite.js";
import { jsToTypescriptProfile } from "./js-to-typescript.js";
import { angularLegacyToModernProfile } from "./angular-legacy-to-modern.js";
import { expressToFastifyProfile } from "./express-to-fastify.js";
import { angularjsToAngularProfile } from "./angularjs-to-angular.js";
import { python2ToPython3Profile } from "./python2-to-python3.js";
import { mysqlToPostgresqlProfile } from "./mysql-to-postgresql.js";
import { craToNextjsProfile } from "./cra-to-nextjs.js";
import { jqueryToVanillaProfile } from "./jquery-to-vanilla.js";
import { restToGraphqlProfile } from "./rest-to-graphql.js";
import { javaToKotlinProfile } from "./java-to-kotlin.js";
import { commonjsToEsmProfile } from "./commonjs-to-esm.js";

const profiles = new Map<string, MigrationProfile>();

profiles.set(vue2ToVue3Profile.id, vue2ToVue3Profile);
profiles.set(reactClassToHooksProfile.id, reactClassToHooksProfile);
profiles.set(webpackToViteProfile.id, webpackToViteProfile);
profiles.set(jsToTypescriptProfile.id, jsToTypescriptProfile);
profiles.set(angularLegacyToModernProfile.id, angularLegacyToModernProfile);
profiles.set(expressToFastifyProfile.id, expressToFastifyProfile);
profiles.set(angularjsToAngularProfile.id, angularjsToAngularProfile);
profiles.set(python2ToPython3Profile.id, python2ToPython3Profile);
profiles.set(mysqlToPostgresqlProfile.id, mysqlToPostgresqlProfile);
profiles.set(craToNextjsProfile.id, craToNextjsProfile);
profiles.set(jqueryToVanillaProfile.id, jqueryToVanillaProfile);
profiles.set(restToGraphqlProfile.id, restToGraphqlProfile);
profiles.set(javaToKotlinProfile.id, javaToKotlinProfile);
profiles.set(commonjsToEsmProfile.id, commonjsToEsmProfile);

export function getProfile(id: string): MigrationProfile | undefined {
  return profiles.get(id);
}

export function listProfiles(): string[] {
  return Array.from(profiles.keys());
}

export function getAllProfiles(): MigrationProfile[] {
  return Array.from(profiles.values());
}

/**
 * Auto-detect the best matching profile for a project by reading its
 * package.json and scoring each profile by dependency rule matches.
 */
export async function detectProfile(
  projectPath: string,
): Promise<MigrationProfile | undefined> {
  const pkgPath = path.join(projectPath, "package.json");
  let allDeps: Record<string, string> = {};

  try {
    const raw = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(raw);
    allDeps = {
      ...((pkg.dependencies as Record<string, string>) ?? {}),
      ...((pkg.devDependencies as Record<string, string>) ?? {}),
    };
  } catch {
    return undefined;
  }

  let bestProfile: MigrationProfile | undefined;
  let bestScore = 0;

  for (const profile of profiles.values()) {
    let score = 0;
    for (const rule of profile.dependencyRules) {
      if (allDeps[rule.name]) {
        score += rule.severity === "breaking" ? 3 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestProfile = profile;
    }
  }

  return bestProfile;
}
