import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useWorkout } from '../context/WorkoutContext';
import { quickStartPlan } from '../workout/quickStart';
import { calculatePlanStats } from '../workout/steps';
import { formatDuration } from '../utils/format';
import { useThemeColors } from '../theme';
import { Dropdown } from './Dropdown';
import { PrimaryButton } from './PrimaryButton';
import { timingFromSettings } from '../workout/timing';
export function QuickStart() {
  const colors = useThemeColors();
  const { exercises, settings, plan, setPlan, dismissUndo } = useWorkout();
  const [open,setOpen] = useState(plan.items.length === 0);
  const [equipment,setEquipment] = useState<'kettlebell'|'bodyweight'>('kettlebell');
  const [minutes,setMinutes] = useState(10);
  const [level,setLevel] = useState<'Beginner'|'Intermediate'>('Beginner');
  const [goal,setGoal] = useState<'Strength'|'Conditioning'>('Strength');
  const timing = useMemo(() => timingFromSettings(settings), [settings.autoAdvanceExercises, settings.secondsPerRep, settings.transitionSeconds]);
  const proposed = useMemo(()=>quickStartPlan(equipment,minutes,level,goal,settings.defaultWeightKg,exercises,timing),[equipment,minutes,level,goal,settings.defaultWeightKg,exercises,timing]);
  const apply = () => { dismissUndo(); setPlan(proposed); setOpen(false); };
  return <View style={{ gap: 10 }}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={()=>setOpen(!open)} style={{ minHeight: 48, justifyContent:'center' }}><Text style={{ color: colors.text, fontWeight:'900',fontSize:17 }}>Quick workout {open ? '▴' : '▾'}</Text></Pressable>
    {open && <>
      <Dropdown label="Equipment" value={equipment} options={[{value:'kettlebell',label:'Kettlebell'},{value:'bodyweight',label:'Bodyweight'}]} onChange={v=>setEquipment(v as typeof equipment)}/>
      <Dropdown label="Available time" value={String(minutes)} options={[10,15,20].map(v=>({value:String(v),label:`About ${v} minutes`}))} onChange={v=>setMinutes(Number(v))}/>
      <Dropdown label="Experience" value={level} options={['Beginner','Intermediate'].map(v=>({value:v,label:v}))} onChange={v=>setLevel(v as typeof level)}/>
      <Dropdown label="Focus" value={goal} options={['Strength','Conditioning'].map(v=>({value:v,label:v}))} onChange={v=>setGoal(v as typeof goal)}/>
      <Text style={{color:colors.text,lineHeight:21}}>{proposed.items.map(i=>exercises.find(e=>e.id===i.exerciseId)?.name).join(' · ')}</Text>
      <Text style={{color:colors.muted,fontSize:14,lineHeight:20}}>{proposed.rounds} rounds · About {formatDuration(calculatePlanStats(proposed,exercises,timing).estimatedSeconds)}. {timing ? 'Includes exercise switches; pauses add time.' : 'Timing depends on your rep pace.'} {equipment === 'kettlebell' ? 'Review the weight before starting.' : ''}</Text>
      <PrimaryButton label="Use this workout" onPress={()=>plan.items.length ? Alert.alert('Replace current plan?', 'Your current unsaved builder plan will be replaced.',[{text:'Cancel',style:'cancel'},{text:'Replace',onPress:apply}]) : apply()}/>
    </>}
  </View>;
}
