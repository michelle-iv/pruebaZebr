import { useCallback, useEffect } from "react";
import NfcManager, { NfcEvents, Ndef, type TagEvent } from "react-native-nfc-manager";

function parseNdef(tag: TagEvent): string | null {
  if (
    tag.ndefMessage &&
    Array.isArray(tag.ndefMessage) &&
    tag.ndefMessage.length > 0
  ) {
    const ndefRecord = tag.ndefMessage[0];
    return Ndef.text.decodePayload(new Uint8Array(ndefRecord.payload));
  }
  return null;
}

export function useNfcListener({
  onNfcScanned,
  enabled = true,
}: {
  onNfcScanned: (data: { tagId: string; passNumber: string | null }) => void;
  enabled?: boolean;
}) {
  const handleTagDiscovery = useCallback(
    (tag: TagEvent) => {
      if (tag.id) {
        const passNumber = parseNdef(tag);
        onNfcScanned({ tagId: tag.id, passNumber });
      }
    },
    [onNfcScanned],
  );

  useEffect(() => {
    async function initNfc() {
      const isSupported = await NfcManager.isSupported();
      if (isSupported) {
        await NfcManager.start();
      }
    }
    initNfc();

    if (enabled) {
      const cleanUp = () => {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        NfcManager.unregisterTagEvent().catch(() => 0);
      };

      const register = async () => {
        try {
          await NfcManager.registerTagEvent();
          NfcManager.setEventListener(NfcEvents.DiscoverTag, handleTagDiscovery);
        } catch {
          NfcManager.unregisterTagEvent().catch(() => 0);
        }
      };

      register();
      return cleanUp;
    }
  }, [enabled, handleTagDiscovery]);
}
