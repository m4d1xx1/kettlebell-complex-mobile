import { AutoTiming } from '../workout/session';
import { Text, View } from 'react-native';
import { WorkoutPlan } from '../types';
import { WorkoutStep, calculatePlanStats } from '../workout/steps';
import { useThemeColors } from '../theme';
import { formatDuration } from '../utils/format';
export function WorkoutOverview({ plan, steps, manualRest, autoTiming }: {plan:WorkoutPlan;steps:WorkoutStep[];manualRest:boolean;autoTiming?:AutoTiming}) {
  const colors = useThemeColors();
  const catalog=steps.map(s=>s.exercise);
  const stats=calculatePlanStats(plan,catalog,autoTiming);
  return <View style={{gap:12,paddingVertical:16}}>
    <Text accessibilityRole="header" style={{color:colors.text,fontSize:22,fontWeight:'900'}}>Your workout</Text>
    <Text style={{color:colors.muted,fontSize:15,lineHeight:22}}>About {formatDuration(stats.estimatedSeconds)} · {plan.rounds} rounds · {plan.restSeconds}s rest between rounds. {manualRest ? 'Continue manually after rest.' : 'Next round starts automatically.'}</Text>
    <Text style={{color:colors.muted,fontSize:13}}>{autoTiming ? 'Includes countdown and exercise switches; pauses add time.' : 'Estimate depends on your rep pace; pauses add time.'} Review the order, sides and weight before starting.</Text>
    {steps.map((step,index)=><View key={step.stepKey} style={{backgroundColor:colors.card,borderRadius:12,padding:14,gap:6,borderLeftWidth:3,borderLeftColor:step.exercise.equipment==='bodyweight'?colors.bodyweight:colors.accent}}>
      <Text style={{color:colors.text,fontSize:17,fontWeight:'800'}}>{index+1}. {step.exercise.name}</Text>
      <Text style={{color:colors.muted,fontSize:15}}>{step.value} {step.mode==='time'?'seconds':'reps'}{step.side!=='none'?` · ${step.side.toUpperCase()}`:''} · {step.exercise.equipment==='bodyweight'?'Bodyweight':`${plan.weightKg} kg`}</Text>
    </View>)}
    <Text style={{color:colors.muted,fontSize:14}}>This sequence repeats each round. {autoTiming ? 'Rep targets are logged as estimated when their timer ends.' : 'Only completed reps and recorded timed work count toward your results.'}</Text>
  </View>;
}
