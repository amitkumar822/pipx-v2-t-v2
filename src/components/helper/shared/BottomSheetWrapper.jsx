import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text } from "react-native";

export const BottomSheetWrapper = ({
  setBottomSheetModalRef,
  setActivateSheet,
  activateSheet,
  children,
  snapPoints = 50,
}) => {
  const bottomSheetModalRef = useRef(null);

  const snapPoint = useMemo(() => [`${snapPoints}%`], []);

  const handleSheetChanges = useCallback((index) => {
    setActivateSheet(false);
  }, []);

  // useEffect(() => {
  //   if (activateSheet) {
  //     setBottomSheetModalRef(bottomSheetModalRef);
  //   }
  // }, [activateSheet]);

  useEffect(() => {
    if (activateSheet && bottomSheetModalRef?.current) {
      setBottomSheetModalRef(bottomSheetModalRef);
    }
  }, [activateSheet, bottomSheetModalRef]);

  return (
    <BottomSheet
      style={styles.contentContainer}
      ref={bottomSheetModalRef}
      onChange={handleSheetChanges}
      index={-1}
      snapPoints={snapPoint}
      enablePanDownToClose={true}
      enableOverDrag={false}
    >
      <BottomSheetView style={styles.contentContainer}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
