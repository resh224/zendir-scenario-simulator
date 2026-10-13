(function (scope) {
  'use strict';
  const roles = ['operator', 'cyber', 'instructor'];
  const both = ['operator', 'cyber'];
  const observation = (id, sourceTime, receiptTime, visibility, title, text) => ({id, sourceTime, receiptTime, visibility, title, text, actor: visibility.length === 2 ? 'Ground systems' : visibility[0] === 'cyber' ? 'Cyber sensors' : 'Spacecraft systems', type: 'observation'});
  const scenarios = {
    telemetry: {
      title: 'Unreliable Telemetry', chapter: '01', pressure: 'The next observation depends on a sound pointing decision.',
      story: 'A spacecraft reports a pointing deviation as its observation window approaches. Is the spacecraft off target, or is the report misleading? A correction made on the wrong evidence could move a healthy spacecraft away from its target.',
      question: 'What evidence would justify changing the spacecraft state?',
      truth: {benign: 'A reporting fault creates the deviation. The reference pointing state remains on target.', malicious: 'A malicious configuration change moves the pointing state off target. The initial report resembles the benign fault.'},
      initial: {pointing: 'Reported deviation; reference state unavailable', command: 'Available', link: 'Available', opportunity: 'Open until configured T+180 s'},
      events: v => [observation('pointing',0,0,both,'Pointing Deviation','Telemetry reports a deviation. This indication alone does not distinguish the two causes.'), observation('alert',10,30,['cyber'],'Anomaly Ticket','An anomaly ticket is available. Alert confidence is unspecified; it is not a probability that a correction will work.'), observation('reference',20,60,both,'Reference Pointing',v==='benign'?'The separate reference reports on-target pointing despite the telemetry deviation.':'The separate reference reports an off-target pointing state.'), observation('configuration',35,90,['cyber'],'Configuration Trace',v==='benign'?'No matching configuration change appears in this synthetic trace.':'A configuration change precedes the reported deviation in this synthetic trace.')],
      actions: [
        {id:'seek',label:'Seek More Evidence',description:'Request a separate pointing check before committing to a correction.'},
        {id:'hold',label:'Hold The Current State',description:'Withhold a correction and preserve the current spacecraft state.'},
        {id:'correct',label:'Apply The Configured Correction',description:'Apply the training procedure after the reference check arrives.',requires:'reference'}
      ]
    },
    command: {
      title:'Unauthorized Command', chapter:'02', pressure:'Contain the command without losing the crew’s ability to control the mission.',
      story:'A ground command appears outside the approved plan. The cyber defender examines its origin while the spacecraft operator checks receipt and execution. Isolating the suspect route may contain the command, but it also removes a control path.',
      question:'How can containment preserve enough command availability to protect the mission?',
      truth:{malicious:'The suspect route carries an unauthorized command. A configured alternate route can restore crew control after containment.'},
      initial:{pointing:'No new pointing report',command:'Primary route available',link:'Available',opportunity:'Observation pending command decision'},
      events:()=>[observation('queue',0,0,both,'Unexpected Command','A command appears outside the configured plan. Receipt and execution are separate states.'),observation('provenance',5,30,['cyber'],'Command Provenance','The command originates on the suspect ground route; no matching authorization record is present.'),observation('receipt',15,60,['operator'],'Command Receipt','The spacecraft reports receipt. The configured execution gate is holding the command.'),observation('alternate',40,90,both,'Alternate Route Check','The synthetic alternate command route passes the configured route check.')],
      actions:[{id:'seek',label:'Seek More Evidence',description:'Request a shared authorization and command-state review.'},{id:'hold',label:'Hold The Execution Gate',description:'Keep the command queued while preserving the present route.'},{id:'contain',label:'Contain The Suspect Route',description:'Isolate the route and block its queued command.',requires:'provenance'},{id:'restore',label:'Use The Alternate Route',description:'Restore command availability after containment and a route check.',requires:'alternate',after:'contain'}]
    },
    link:{
      title:'Impaired Command And Control',chapter:'03',pressure:'The contact window is closing. The latest screen may show old state.',
      story:'Commands and telemetry no longer arrive together. The crew has to decide whether to wait, investigate, or use a configured recovery path. A delayed message may describe a state that has already changed.',
      question:'What can the crew safely conclude while observations are delayed?',
      truth:{benign:'A benign communications interruption delays observations. Recovery still depends on the configured contact window.',malicious:'A malicious link disruption delays observations. Recovery still depends on the configured contact window.'},
      initial:{pointing:'Last received state; current state unknown',command:'Acknowledgment delayed',link:'Impaired; next contact T+90–150 s',opportunity:'Pending recovery; final state unavailable'},
      events:v=>[observation('gap',0,0,both,'Acknowledgment Gap','No fresh acknowledgment is available. Last received telemetry must not be treated as current truth.'),observation('link-alert',10,30,['cyber'],'Link Anomaly Ticket','A communications anomaly is recorded. It does not establish an attack by itself.'),observation('contact',30,60,both,'Contact Forecast','The configured recovery contact is T+90–150 s. The scenario clock controls availability.'),observation('delayed',15,90,['operator'],'Delayed Telemetry','A message generated at T+15 s arrives at T+90 s. It is received now, but its source time remains T+15 s.'),observation('link-trace',45,120,['cyber'],'Link Investigation',v==='benign'?'The synthetic trace supports a benign communications interruption.':'The synthetic trace supports a malicious link disruption.')],
      actions:[{id:'seek',label:'Seek More Evidence',description:'Ask the cyber and spacecraft teams to correlate the gap.'},{id:'hold',label:'Hold Until Fresh Evidence',description:'Defer a recovery action and preserve the current configuration.'},{id:'recover',label:'Use The Configured Recovery Path',description:'Attempt recovery during the configured contact.',requires:'contact',window:[90,150]}]
    }
  };
  const faultTypes={
    communications:{label:'Communications lost',cases:['link'],symptom:'No fresh acknowledgment',field:'link',state:'Lost; recovery check pending',check:'The configured contact and backup link pass the recovery check.'},
    malicious:{label:'Malicious command',cases:['command'],symptom:'Unexpected command queued',field:'command',state:'Unexpected command held at execution gate',check:'An authorization review finds no approved record for the queued command.'},
    telemetry:{label:'Telemetry corruption',cases:['telemetry'],symptom:'Telemetry integrity warning',field:'pointing',state:'Conflicting reports; current pointing unconfirmed',check:'An independent pointing source is available for a report-integrity comparison.'},
    antenna:{label:'Antenna pointing fault',cases:['link'],symptom:'Tracking link degraded',field:'link',state:'Degraded tracking; antenna check pending',check:'The antenna check confirms a configured pointing fault; the recovery alignment is available.'}
  };
  // Original teaching fixtures. Values illustrate evidence shape, not customer telemetry.
  function artifact(event,variant){
    const table={
      pointing:{kind:'Telemetry panel',asset:'SV-01 / ADCS',fields:[['Reported error','2.4 deg'],['Independent state','Not received']],samples:[0.1,0.2,2.4,2.4],log:'ADCS_REPORT pointing_error=2.4 deg; integrity=unconfirmed'},
      alert:{kind:'Cyber ticket',asset:'SV-01 / monitor',fields:[['Ticket','DEMO-017'],['Status','Investigate'],['Confidence','Unspecified']],log:'MONITOR anomaly=pointing_mismatch; recommendation=investigate'},
      reference:{kind:'Independent pointing check',asset:'SV-01 / reference',fields:[['Reference error',variant==='benign'?'0.1 deg':'2.4 deg'],['Comparison','Separate observation']],log:'REFERENCE_CHECK source=independent; units=deg'},
      configuration:{kind:'Configuration audit',asset:'SV-01 / ADCS config',fields:[['Matching change',variant==='benign'?'Not found':'Present'],['Review','Correlate with pointing']],log:variant==='benign'?'AUDIT no matching change in this fixture':'AUDIT config_write ref=CFG-042; source_time=T+035 s'},
      queue:{kind:'Command queue',asset:'GS-01 → SV-01',fields:[['Command','ATTITUDE_SET'],['Queue state','Held'],['Authorization','Not yet checked']],log:'QUEUE cmd=ATTITUDE_SET; execution=HELD; plan_match=UNCONFIRMED'},
      provenance:{kind:'Authorization audit',asset:'GS-01 / command gateway',fields:[['Route','Primary / suspect'],['Approved record','Not found']],log:'AUTH_CHECK cmd=ATTITUDE_SET; approved_record=NONE'},
      receipt:{kind:'Spacecraft acknowledgment',asset:'SV-01 / command receiver',fields:[['Receipt','Acknowledged'],['Execution','Held by gate']],log:'ACK cmd=ATTITUDE_SET; received=YES; executed=NO'},
      alternate:{kind:'Route verification',asset:'GS-02 / alternate gateway',fields:[['Route check','Passed'],['Availability','Ready after containment']],log:'ROUTE_CHECK alternate=PASS; suspect_route_must_be_isolated=YES'},
      gap:{kind:'Communications panel',asset:'GS-01 ↔ SV-01',fields:[['Fresh ACK','Unavailable'],['Telemetry age','Check source time']],samples:[12,11,6,2],log:'LINK fresh_ack=NO; current_spacecraft_state=UNKNOWN'},
      'link-alert':{kind:'Cyber ticket',asset:'GS-01 / link monitor',fields:[['Ticket','DEMO-031'],['Cause','Unconfirmed']],log:'MONITOR anomaly=ack_gap; attribution=UNKNOWN'},
      contact:{kind:'Contact schedule',asset:'GS-02 / backup contact',fields:[['Open','T+090 s'],['Close','T+150 s']],log:'CONTACT recovery_window=[90,150] configured_seconds'},
      delayed:{kind:'Delayed telemetry packet',asset:'SV-01 / downlink',fields:[['Packet','DEMO-TLM-015'],['Source','T+015 s'],['Receipt','T+090 s'],['Age at receipt','75 s']],log:'RX packet=DEMO-TLM-015; stale_at_receipt=YES'},
      'link-trace':{kind:'Link investigation',asset:'GS-01 / link audit',fields:[['Trace finding',variant==='benign'?'Benign interruption':'Malicious disruption']],log:variant==='benign'?'TRACE equipment interruption in synthetic record':'TRACE deliberate disruption in synthetic record'}
    };
    return table[event.id]||{kind:'Exercise record',asset:'Mission / crew channel',fields:[['Record',event.id]],log:event.text};
  }
  const clone=x=>JSON.parse(JSON.stringify(x));
  function create(caseId='telemetry',variant='malicious',id='run-001',parent=null) {
    if (!scenarios[caseId] || !scenarios[caseId].truth[variant]) throw Error('Unknown case or variant.');
    const definition=scenarios[caseId];
    return {id,parent,caseId,variant,configuration:`synthetic-${caseId}-${variant}-1`,origin:'Synthetic scenario records; deterministic teaching rules',time:0,status:'Ready',faults:[],handoffs:[],events:definition.events(variant).map((e,i)=>({...e,artifact:artifact(e,variant),sequence:i+1,runId:id,simulationTime:e.receiptTime})),journal:[],log:[],actions:[],notes:[],mission:clone(definition.initial),result:'No decision recorded',procedure:[],coordination:[]};
  }
  function visible(run,role,time=run.time) {
    if(!roles.includes(role)) throw Error('Unknown role.');
    return run.events.filter(e=>e.receiptTime<=time && (role==='instructor'||e.visibility.includes(role))).sort((a,b)=>a.receiptTime-b.receiptTime||a.sequence-b.sequence).map(clone);
  }
  function deliver(run) {
    for(const e of visible(run,'instructor')) if(!run.log.some(l=>l.id===e.id))run.log.push(clone(e));
    run.log.sort((a,b)=>a.simulationTime-b.simulationTime||a.sequence-b.sequence);
  }
  function reason(run,option,role) {
    const a=option==='resolve-fault'?{id:option}:scenarios[run.caseId].actions.find(x=>x.id===option);
    if(!a)return 'Unknown action.';
    if(!both.includes(role))return 'Choose an operator or cyber-defender view to record a crew action.';
    if(!['Running','Paused'].includes(run.status))return 'Start the run before recording a decision. Completed runs remain unchanged.';
    if(option==='resolve-fault'){const fault=run.faults.find(f=>!f.resolved);if(!fault)return 'No active injected fault.';if(!visible(run,role).some(e=>e.id===fault.checkId))return 'The fault recovery check has not reached this role.';}
    if(a.requires&&!visible(run,role).some(e=>(e.id===a.requires||e.parentEvent===a.requires)))return 'The required evidence has not reached this role. Step forward or coordinate with the other crew.';
    if(a.after&&!run.actions.some(x=>x.option===a.after))return 'Contain the suspect route before using this recovery procedure.';
    if(a.window&&(run.time<a.window[0]||run.time>a.window[1]))return 'The configured recovery contact is not open.';
    if(option!=='resolve-fault'&&run.actions.some(x=>x.option===option))return 'This choice is already recorded in this run.';
    return '';
  }
  function consequence(run,option) {
    if(option==='resolve-fault'){const fault=run.faults.find(f=>!f.resolved);if(run.mission[fault.field]===fault.state)run.mission[fault.field]=fault.previous;fault.resolved=true;fault.resolvedTime=run.time;run.result='Injected fault cleared through the configured recovery check. Review the remaining mission state separately.';run.procedure.push('Injected fault recovery recorded.');}
    else if(option==='seek') {
      run.coordination.push('A shared evidence check was requested.');run.result='More evidence requested; the mission state is unchanged while the check travels.';
      run.events.push(observation(`shared-${run.actions.length}`,run.time,run.time+30,both,'Shared Crew Check','The teams share the request and its rationale. This communication does not replace a missing sensor observation.'));
      const e=run.events[run.events.length-1];Object.assign(e,{sequence:run.events.length,runId:run.id,simulationTime:e.receiptTime});
    } else if(option==='hold') {run.result=run.caseId==='telemetry'?'Current state held. The final observation depends on the actual pointing state.':'Crew holds the current configuration while uncertainty remains.';run.procedure.push('The crew deferred a state change.');}
    else if(option==='correct') {run.mission.pointing=run.variant==='malicious'?'Configured correction returns pointing on target':'Configured correction moves the already healthy reference state off target';run.result='Correction applied. Debrief compares the resulting pointing state with the separate reference.';run.procedure.push('Configured correction applied after the reference check.');}
    else if(option==='contain') {run.mission.command='Suspect route isolated; alternate not yet enabled';run.result='Queued command blocked. The suspect command path is unavailable.';run.procedure.push('Suspect route contained; command availability must be restored separately.');}
    else if(option==='restore') {run.mission.command='Alternate route available; suspect route isolated';run.result='Control restored through the configured alternate route.';run.procedure.push('Alternate route selected after its check and containment.');}
    else if(option==='recover') {run.mission.link='Recovery path available';run.mission.command='Acknowledgment available through recovery path';run.result='Recovery completed during the configured contact window.';run.procedure.push('Configured recovery used within the available contact.');}
  }
  function finish(run) {
    if(run.caseId==='telemetry') {
      const corrected=run.actions.some(a=>a.option==='correct');const onTarget=run.variant==='malicious'?corrected:!corrected;
      run.mission.pointing=onTarget?'Reference state on target':'Reference state off target';run.mission.opportunity=onTarget?'Configured observation preserved':'Configured observation missed';run.result=`${run.mission.opportunity}. ${corrected?'A correction changed the reference state.':'The crew left the reference state unchanged.'}`;
    } else if(run.caseId==='command') {run.mission.opportunity=run.actions.some(a=>a.option==='restore')?'Control path available for the next mission decision':'Command review or route recovery still required';}
    else {run.mission.opportunity=run.actions.some(a=>a.option==='recover')?'Recovery contact used':'Recovery contact passed without a configured recovery';}
    const active=run.faults.find(f=>!f.resolved);if(active){run.mission[active.field]=active.state;run.mission.opportunity='Residual injected fault requires recovery';run.result='The run ended with an unresolved injected fault. Mission recovery is incomplete.';}
    run.status='Complete';
  }
  function reduce(input,command) {
    const run=clone(input);
    switch(command.type) {
      case 'start':if(!['Ready','Paused'].includes(run.status))throw Error('This run cannot start.');run.status='Running';deliver(run);break;
      case 'pause':if(run.status!=='Running')throw Error('Only a running exercise can pause.');run.status='Paused';break;
      case 'step':if(!['Running','Paused'].includes(run.status))throw Error('Start or reset the exercise before stepping.');run.time=Math.min(180,run.time+30);deliver(run);if(run.time===180)finish(run);break;
      case 'stop':if(!['Running','Paused'].includes(run.status))throw Error('Only an active run can stop.');run.status='Complete';run.result='Exercise stopped before the configured endpoint; no final mission outcome inferred.';break;
      case 'action':{
        const why=reason(run,command.option,command.role);if(why)throw Error(why);
        const record={id:`decision-${run.actions.length+1}`,runId:run.id,role:command.role,actor:command.role,option:command.option,time:run.time,simulationTime:run.time,sourceTime:run.time,receiptTime:run.time,sequence:run.events.length+run.actions.length+1,visibility:both,type:'decision',evidenceIds:visible(run,command.role).map(e=>e.id),rationale:String(command.rationale||'No rationale entered').slice(0,2000),preconditionResult:'Met'};
        run.actions.push(record);run.log.push(clone(record));consequence(run,command.option);break;
      }
      case 'inject':{
        const f=faultTypes[command.fault];
        if(command.role!=='instructor'||!['Running','Paused'].includes(run.status))throw Error('Fault injection requires an active Instructor view.');
        if(!f||!f.cases.includes(run.caseId))throw Error('Choose a fault compatible with this case.');
        if(run.time>120)throw Error('Inject by T+120 s so the check can arrive before the endpoint.');
        if(run.faults.some(x=>!x.resolved))throw Error('Recover the active injected fault first.');
        const id=`fault-${run.faults.length+1}`,checkId=id+'-check';
        run.faults.push({id,type:command.fault,label:f.label,time:run.time,checkId,field:f.field,state:f.state,previous:run.mission[f.field],resolved:false});
        run.mission[f.field]=f.state;run.result='An injected disturbance changes the mission state. Crews must investigate its observations.';
        const event=observation(id,run.time,run.time,both,f.symptom,'An injected exercise disturbance affects this asset. The symptom alone does not establish its cause.');
        const check=observation(checkId,run.time+15,run.time+30,both,'Fault Recovery Check',f.check);
        for(const e of [event,check]){Object.assign(e,{sequence:run.events.length+1,runId:run.id,simulationTime:e.receiptTime,artifact:{kind:'Injected exercise observation',asset:run.caseId==='telemetry'?'SV-01 / ADCS':'GS-01 / mission link',fields:[['State',e===event?'Investigate':'Recovery check received']],log:e.text}});run.events.push(e);}
        deliver(run);break;
      }
      case 'share':{
        if(!both.includes(command.role)||!['Running','Paused'].includes(run.status))throw Error('Sharing requires an active crew view.');
        const evidence=visible(run,command.role).find(e=>e.id===command.evidenceId);
        if(!evidence)throw Error('Share only evidence received by this role.');
        if(run.time>=180||run.handoffs.some(h=>h.evidenceId===evidence.id&&h.sender===command.role))throw Error('This evidence has already been shared by this role.');
        const id=`handoff-${run.handoffs.length+1}`,recipient=command.role==='operator'?'cyber':'operator',receiptTime=run.time+30;
        run.handoffs.push({id,evidenceId:evidence.id,sender:command.role,recipient,time:run.time,receiptTime,title:evidence.title});
        run.events.push({...clone(evidence),id,title:'Crew Handoff: '+evidence.title,receiptTime,visibility:both,actor:'Crew channel',sequence:run.events.length+1,runId:run.id,simulationTime:receiptTime,parentEvent:evidence.id});
        run.coordination.push('Evidence sent over the crew channel; delivery takes 30 configured seconds.');break;
      }
      case 'note':{
        if(!both.includes(command.role)||!['Running','Paused'].includes(run.status))throw Error('Crew notes require an active crew view.');
        const text=String(command.text||'').trim().slice(0,2000);if(!text)throw Error('Enter a note first.');
        run.notes.push({id:`note-${run.notes.length+1}`,actor:command.role,recipients:both,time:run.time,text});run.coordination.push('Crew note recorded for both crew roles.');break;
      }
      default:throw Error('Unknown command.');
    }
    run.journal.push(clone(command));
    return run;
  }
  function replay(original) {
    let run=create(original.caseId,original.variant,original.id,original.parent);
    if(Array.isArray(original.journal)) {
      if(original.journal.length>1000)throw Error('Run contains too many commands.');
      for(const command of original.journal)run=reduce(run,command);
      return run;
    }
    run=reduce(run,{type:'start'});
    for(let time=0;time<=original.time;time+=30) {
      if(time>0)run=reduce(run,{type:'step'});
      for(const a of original.actions.filter(a=>a.time===time))run=reduce(run,{type:'action',option:a.option,role:a.role,rationale:a.rationale});
      for(const n of original.notes.filter(n=>n.time===time))run=reduce(run,{type:'note',role:n.actor,text:n.text});
    }
    if(original.status==='Complete'&&original.time<180)run=reduce(run,{type:'stop'});
    if(original.status==='Paused')run=reduce(run,{type:'pause'});
    if(original.status==='Ready')return clone(original);
    return run;
  }
  function alternative(original,option,role,id='alternative-001') {
    const decision=original.actions.find(a=>a.option!=='seek')||original.actions[0];
    if(!decision)throw Error('Record a decision before comparing an alternative.');
    let branch=create(original.caseId,original.variant,id,original.id);if(!original.journal)branch=reduce(branch,{type:'start'});
    if(original.journal){let actionIndex=0;for(const c of original.journal){if(c.type==='action'&&actionIndex++===original.actions.indexOf(decision))break;branch=reduce(branch,c);}}
    else for(const a of original.actions.slice(0,original.actions.indexOf(decision))){while(branch.time<a.time)branch=reduce(branch,{type:'step'});branch=reduce(branch,{type:'action',option:a.option,role:a.role,rationale:a.rationale});}
    while(branch.time<decision.time)branch=reduce(branch,{type:'step'});
    branch=reduce(branch,{type:'action',option,role,rationale:'Configured alternative from the same starting state and decision time.'});
    while(branch.time<180)branch=reduce(branch,{type:'step'});
    return branch;
  }
  const api={scenarios,faultTypes,roles,create,visible,reason,reduce,replay,alternative};
  if(typeof module!=='undefined')module.exports=api;else scope.Zendir=api;
})(typeof globalThis==='undefined'?this:globalThis);
