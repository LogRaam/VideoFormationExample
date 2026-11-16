import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {C, fonts} from './theme';
import {Q} from './lib/cues';
import {TL, useT} from './lib/time';

/**
 * Animatic: grey placeholder blocks driven by the same cue table as the final
 * film, played against the real narration. Used to validate rhythm, pauses and
 * on-screen timing before any final animation is built.
 */
type Beat = {t: number; seq: string; what: string};

const BEATS: Beat[] = [
  {t: Q.open, seq: 'S1', what: 'Gros plan : téléphone, ancien tableau de bord'},
  {t: Q.team, seq: 'S1', what: 'Recul : logiciel au centre, branche principale; une branche part'},
  {t: Q.build, seq: 'S1', what: 'Le module « Nouveau tableau de bord » se construit sur la branche'},
  {t: Q.merge, seq: 'S1', what: 'Fusion : la branche rejoint la principale'},
  {t: Q.inSoftware, seq: 'S1', what: 'Le module entre dans le logiciel — version 2.0'},
  {t: Q.devs, seq: 'S2', what: 'Développeurs : aiguillage + prise du flag'},
  {t: Q.deploy, seq: 'S2', what: 'Déploiement : le logiciel monte sur la plateforme Production'},
  {t: Q.flagOff, seq: 'S2', what: 'Valeur du flag : désactivé'},
  {t: Q.clients, seq: 'S2', what: 'Voie teal ancien module → téléphone : ancien tableau'},
  {t: Q.asleep, seq: 'S2', what: 'Nouveau module « endormi »'},
  {t: Q.reveal, seq: 'S3', what: 'Recul : LaunchDarkly glisse à gauche'},
  {t: Q.toggleOn, seq: 'S3', what: 'Responsable : bascule ACTIVÉ'},
  {t: Q.transmit, seq: 'S3', what: 'Paquet de configuration LD → application'},
  {t: Q.memory, seq: 'S3', what: 'Valeur en mémoire : activé (écran du client inchangé)'},
  {t: Q.opens, seq: 'S3', what: 'Le client ouvre son tableau de bord'},
  {t: Q.evaluate, seq: 'S3', what: "Évaluation dans l'application"},
  {t: Q.showsNew, seq: 'S3', what: 'Nouveau tableau de bord affiché'},
  {t: Q.unchanged, seq: 'S3', what: 'Logiciel : version 2.0 inchangée · déploiements : 1'},
  {t: Q.onlyConfig, seq: 'S3', what: 'Seule la configuration a changé'},
  {t: Q.bug, seq: 'S4', what: 'Problème sur le nouveau tableau'},
  {t: Q.toggleOff, seq: 'S4', what: 'Bascule DÉSACTIVÉ · paquet'},
  {t: Q.nextEval, seq: 'S4', what: 'Prochaine évaluation → ancien tableau'},
  {t: Q.sameVersion, seq: 'S4', what: 'Même version · aucun redéploiement'},
  {t: Q.recap, seq: 'S5', what: 'Synthèse'},
  {t: Q.develop, seq: 'S5', what: 'Ligne 1 : Développer → Fusionner → Déployer'},
  {t: Q.configure, seq: 'S5', what: 'Ligne 2 : Configurer → Évaluer → Choisir'},
  {t: Q.demo, seq: 'S5', what: 'Démo rapide : même logiciel, 2 comportements'},
  {t: Q.final1, seq: 'S5', what: 'Conclusion'},
];

const Block: React.FC<{x: number; label: string; color: string; on: boolean}> = ({x, label, color, on}) => (
  <div style={{position: 'absolute', left: x, top: 330, width: 480, height: 360, borderRadius: 24, border: `4px solid ${color}`, background: on ? `${color}33` : '#ffffff08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: C.text, fontFamily: fonts.head}}>
    {label}
  </div>
);

export const Animatic: React.FC = () => {
  const t = useT();
  const cur = [...BEATS].reverse().find((b) => t >= b.t) ?? BEATS[0];
  const words = TL.scenes.flatMap((s) => s.segments).find((s) => t >= s.start - 0.2 && t <= s.end + 0.3);
  const flagOn = (t >= Q.memory && t < Q.toggleOff + 2) || (t >= Q.demo && Math.floor((t - Q.demo) / 1.2) % 2 === 0);
  const userNew = (t >= Q.showsNew && t < Q.backOld) || (t >= Q.demo && Math.floor((t - Q.demo) / 1.2) % 2 === 0);
  return (
    <AbsoluteFill style={{background: C.bg0, fontFamily: fonts.body}}>
      <div style={{position: 'absolute', left: 60, top: 40, fontSize: 36, color: C.sub}}>{`ANIMATIQUE · ${cur.seq} · ${t.toFixed(1)} s`}</div>
      <div style={{position: 'absolute', left: 60, top: 120, right: 60, fontSize: 52, color: C.text, fontWeight: 700}}>{cur.what}</div>
      <Block x={120} label={`LaunchDarkly${t >= Q.reveal ? (flagOn ? ' · ON' : ' · OFF') : ''}`} color={C.conf} on={t >= Q.reveal && t < Q.recap} />
      <Block x={720} label="Logiciel v2.0" color={C.soft} on={t >= Q.inSoftware} />
      <Block x={1320} label={userNew ? 'Nouveau tableau' : 'Ancien tableau'} color={C.beh} on />
      {words && <div style={{position: 'absolute', left: 120, right: 120, bottom: 90, fontSize: 40, color: C.text, textAlign: 'center'}}>{words.text}</div>}
      <Audio src={staticFile('audio/narration.fr.wav')} />
    </AbsoluteFill>
  );
};
