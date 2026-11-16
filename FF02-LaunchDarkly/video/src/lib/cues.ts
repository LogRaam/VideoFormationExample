import {scene, seg, TL, w} from './time';

/**
 * Every story event of the film, in global seconds, anchored on the words of the
 * narration (forced alignment). The animatic and the final stage both read this
 * table, so picture and voice stay in sync when the narration is regenerated.
 */
export const Q = {
  // S1 — a new feature
  open: 0,
  bankApp: w('i1', "l'application"),
  oldDash: w('i1', 'tableau'),
  team: w('i2', 'équipe'),
  build: w('i2', 'développe'),
  ready: w('i2', 'prêt,'),
  merge: w('i2', 'fusionnée'),
  main: w('i2', 'principale.'),
  inSoftware: w('i3', 'voilà'),
  softwareWord: w('i3', 'logiciel.'),

  // S2 — deployed, but inactive
  devs: w('d1', 'développeurs'),
  flagWired: w('d1', 'feature'),
  flagName: w('d1', 'indicateur'),
  version: w('d2', 'version'),
  deploy: w('d2', 'déployée'),
  production: w('d2', 'production,'),
  bothDash: w('d2', 'deux'),
  flagOff: w('d3', 'désactivé:'),
  clients: w('d3', 'clients'),
  stillOld: w('d3', "l'ancien."),
  present: w('d4', 'là…'),
  asleep: w('d4', 'dort.'),
  s2End: seg('d4').end,

  // S3 — the mechanism
  reveal: scene('flag').start - 0.6,
  outside: w('f1', "l'extérieur"),
  ld: w('f1', 'LaunchDarkly.'),
  owner: w('f2', 'responsable'),
  toggleOn: w('f2', "l'active."),
  transmit: w('f3', 'transmet'),
  configArrive: w('f3', "l'application,"),
  memory: w('f3', 'garde'),
  opens: w('f4', 'ouvre'),
  evaluate: w('f4', 'évalue'),
  activated: w('f4', 'activé.'),
  showsNew: w('f4', 'affiche'),
  unchanged: w('f5', 'logiciel'),
  onlyConfig: w('f5', 'configuration'),
  s3End: seg('f5').end,

  // S4 — roll back
  bug: scene('rollback').start - 0.8,
  problem: w('r1', 'problème?'),
  toggleOff: w('r1', 'désactive'),
  nextEval: w('r2', 'prochaine'),
  evaluate2: w('r2', 'évaluation,'),
  backOld: w('r2', "l'ancien"),
  sameVersion: w('r2', 'Même'),
  noRedeploy: w('r2', 'aucun'),
  s4End: seg('r2').end,

  // S5 — final mental model
  recap: scene('recap').start - 1.0,
  twoSteps: w('c1', 'deux'),
  develop: w('c1', 'Développer,'),
  mergeR: w('c1', 'fusionner,'),
  deployR: w('c1', 'déployer:'),
  entersApp: w('c1', 'entre'),
  configure: w('c2', 'Configurer'),
  evaluateR: w('c2', 'évaluer,'),
  choose: w('c2', 'choisir'),
  decide: w('c2', 'décide'),
  demo: seg('c2').end + 0.1,
  final1: w('c3', 'déploiement'),
  final2: w('c3', 'feature'),
  control: w('c3', 'contrôler'),
  end: TL.duration,
};

export type CueName = keyof typeof Q;
