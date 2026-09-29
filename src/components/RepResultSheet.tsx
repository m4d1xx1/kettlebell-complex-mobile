import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from './PrimaryButton';
import { NumberStepper } from './NumberStepper';
import { colors } from '../theme';
export function RepResultSheet({ name, target, ending, onSave, onCancel }: { name: string; target: number; ending: boolean; onSave: (count: number) => void; onCancel: () => void }) {
  const [text,setText] = useState('0');
  const count = Number(text);
  const valid = /^\d+$/.test(text) && Number.isInteger(count) && count >= 0 && count <= target;
  return <Modal animationType="slide" onRequestClose={onCancel}>
    <SafeAreaView style={{flex:1,backgroundColor:colors.bg}}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:24,gap:20,flexGrow:1,justifyContent:'center'}}>
          <Text accessibilityRole="header" style={{color:colors.text,fontSize:26,fontWeight:'900'}}>Reps completed</Text>
          <Text style={{color:colors.text,fontSize:19}}>{name}</Text>
          <Text style={{color:colors.muted,fontSize:16}}>Workout paused. Record what you actually completed, from 0 to {target} reps. Fewer than the target marks this step as partial.</Text>
          <TextInput accessibilityLabel="Completed repetitions" value={text} onChangeText={setText} keyboardType="number-pad" selectTextOnFocus style={{color:colors.text,borderWidth:1,borderColor:colors.border,borderRadius:12,padding:16,fontSize:32,textAlign:'center'}}/>
          <NumberStepper label="Completed reps" value={valid ? count : 0} min={0} max={target} haptics={false} onChange={value=>setText(String(value))}/>
          {!valid && <Text accessibilityRole="alert" style={{color:colors.danger}}>Enter a whole number from 0 to {target}.</Text>}
          <View style={{gap:12}}><PrimaryButton disabled={!valid} label={ending ? 'Save reps & end workout' : 'Save reps & continue'} onPress={()=>{if(valid)onSave(count)}}/><PrimaryButton label="Cancel · keep paused" onPress={onCancel}/></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}
