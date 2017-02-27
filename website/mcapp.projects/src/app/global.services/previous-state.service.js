/*@ngInject*/
function previousStateService($previousState) {
    return {
        go: function(memo) {
            if (memo) {
                let previousMemo = $previousState.get(memo);
                if (!previousMemo) {
                    $previousState.go();
                } else {
                    $previousState.go(memo);
                    $previousState.forget(memo);
                }
            } else {
                $previousState.go();
            }
        },

        setMemo: function(memo, state) {
            let previousMemo = $previousState.get(memo);
            let previousState = $previousState.get();
            if (!previousMemo) {
                $previousState.memo(memo);
            } else {
                // previousMemo is not null, but the user may not have cancelled to clear
                // the previousMemo. That is they may have gone to the tabs or other mechanism
                // rather than, eg, the cancel button to get out of a state.
                if (previousState.state.name !== state) {
                    // User did not cancel, so we have an old state. Save new previous state
                    // so user will go where they expect if they press the cancel button.
                    $previousState.memo(memo);
                }
            }
        }
    }
}

angular.module('materialscommons').factory('previousStateService', previousStateService);

