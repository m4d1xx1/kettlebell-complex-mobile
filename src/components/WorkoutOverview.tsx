import { AutoTiming } from '../workout/session';
import { Text, View } from 'react-native';
import { WorkoutPlan } from '../types';
import { WorkoutStep, calculatePlanStats } from '../workout/steps';
import { colors } from '../theme';
import { formatDuration } from '../utils/format';
export function WorkoutOverview({ plan, steps, manualRest, autoTiming }: {plan:WorkoutPlan;steps:WorkoutStep[];manualRest:boolean;autoTiming?:AutoTiming}) {
  const catalog=steps.map(s=>s.exercise);
  const stats=calculatePlanStats(plan,catalog);
  if (autoTiming) stats.estimatedSeconds = Math.round(steps.reduce((n,s)=>n+(s.mode==='time'?s.value:s.value*autoTiming.secondsPerRep),0)*plan.rounds + Math.max(0,plan.rounds-1)*plan.restSeconds + (Math.max(0,steps.length-1)*plan.rounds + (plan.restSeconds===0?Math.max(0,plan.rounds-1):0))*autoTiming.transitionSeconds);
  return <View style={{gap:12,paddingVertical:16}}>
    <Text accessibilityRole="header" style={{color:colors.text,fontSize:22,fontWeight:'900'}}>Your workout</Text>
    <Text style={{color:colors.muted,fontSize:15,lineHeight:22}}>About {formatDuration(stats.estimatedSeconds)} · {plan.rounds} rounds · {plan.restSeconds}s rest between rounds. {manualRest ? 'Continue manually after rest.' : 'Next round starts automatically.'}</Text>
    <Text style={{color:colors.muted,fontSize:13}}>Estimate depends on your rep pace. Review the order, sides and weight before starting.</Text>
    {steps.map((step,index)=><View key={step.stepKey} style={{backgroundColor:colors.card,borderRadius:12,padding:14,gap:6,borderLeftWidth:3,borderLeftColor:step.exercise.equipment==='bodyweight'?colors.bodyweight:colors.accent}}>
      <Text style={{color:colors.text,fontSize:17,fontWeight:'800'}}>{index+1}. {step.exercise.name}</Text>
      <Text style={{color:colors.muted,fontSize:15}}>{step.value} {step.mode==='time'?'seconds':'reps'}{step.side!=='none'?` · ${step.side.toUpperCase()}`:''} · {step.exercise.equipment==='bodyweight'?'Bodyweight':`${plan.weightKg} kg`}</Text>
    </View>)}
    <Text style={{color:colors.muted,fontSize:14}}>This sequence repeats each round. {autoTiming ? 'Rep targets are logged as estimated when their timer ends.' : 'Only completed reps and recorded timed work count toward your results.'}</Text>
  </View>;
}
