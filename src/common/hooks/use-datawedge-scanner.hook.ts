import {
    ScannerInit,
    ScannerReceiver,
    type ProfileConfigType,
} from '@edritech93/react-native-datawedge-intents';
import { useEffect } from 'react';
import { NativeEventEmitter, Platform } from 'react-native';

export function useDataWedgeScanner(
  onScan: (data: string) => void,
  options?: { profileName?: string; packageName?: string },
) {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const eventEmitter = new NativeEventEmitter();

    const profileConfig: ProfileConfigType = {
      name: options?.profileName ?? 'ZebraScanner',
      package: options?.packageName ?? 'com.mich_iv.myapp',
    };

    ScannerInit(profileConfig);

    const subscription = eventEmitter.addListener(
      'datawedge_broadcast_intent',
      intent => {
        const objResult = ScannerReceiver(intent);
        if (objResult?.data) {
          onScan(objResult.data);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [onScan, options?.profileName, options?.packageName]);
}
