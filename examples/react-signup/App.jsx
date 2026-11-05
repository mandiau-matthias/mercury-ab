import React, {useEffect,useState} from 'react';
import {assign,record} from 'mercury-ab';

export const experiment={key:'react-signup-v1',status:'running',variants:[{key:'control',weight:50},{key:'invitation',weight:50}]};

export function App({visitor,serverAssignment}){
  const [consent,setConsent]=useState(false);
  const [events,setEvents]=useState([]);
  const [checked,setChecked]=useState(false);
  const clientAssignment=assign(experiment,visitor);
  const matches=clientAssignment.variant===serverAssignment.variant && clientAssignment.enrolled===serverAssignment.enrolled;
  const base={experiment:experiment.key,visitor,variant:serverAssignment.variant};
  useEffect(()=>setChecked(true),[]);
  useEffect(()=>{if(matches)setEvents(old=>record(old,{...base,kind:'exposure'},consent,serverAssignment.enrolled));},[consent,matches,visitor,serverAssignment.variant,serverAssignment.enrolled]);
  return <main><p className="eyebrow">AUTOMATRON / MERCURY A/B</p><h1>The same invitation.<br/>On both sides.</h1><p>The server chose this version before sending the page. React checks it again using the same visitor and experiment.</p><section><p id="agreement" role="status">{!checked?'Checking browser assignment…':matches?'Server and browser agree.':'Assignment mismatch. Measurement is paused.'}</p><h2>{serverAssignment.variant==='control'?'Join the workshop':'Make something meaningful with us'}</h2><button onClick={()=>{if(matches)setEvents(old=>record(old,{...base,kind:'signup'},consent,serverAssignment.enrolled));}}>Complete a fictional sign-up</button><label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Allow measurement for this example</label><p>Click twice. A consented exposure and sign-up are each counted once.</p><details open><summary>Inspect this page visit</summary><p>Visitor: <code>{visitor}</code></p><p>Version: <code>{serverAssignment.variant}</code></p><pre aria-label="Recorded events">{JSON.stringify(events,null,2)}</pre></details></section><p>Reload to verify stable assignment. This React example keeps events in memory for the current page visit. No account is created and no event leaves your browser.</p><a href="https://github.com/mandiau-matthias/mercury-ab/tree/main/examples/react-signup">Use this integration</a></main>;
}
