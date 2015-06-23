// validate will validate each of the property settings. It returns
// true if all settings validated.
function validate(process) {
    var allValid = true;
    process.settings.forEach(function(setting) {
        if (!setting.valid) {
            if (setting.property.required) {
                // if property is required then check if it has
                // a value. If not then mark as invalid and
                // go on to the setting setting.
                setting.valid = requiredValidator(setting);
                if (!setting.valid) {
                    // Not valid, mark invalid and go on to the
                    // next setting.
                    allValid = false;
                    return;
                }
            }
            // if setting isn't valid and there is a validator associated with
            // it then run the validator. Otherwise, set the setting to true
            // since there is no way to validate it.
            if (setting.validators.length != 0) {
                for (var i = 0; i < setting.validators.length; i++) {
                    var validator = setting.validators[i];
                    setting.valid = validator(setting.property);
                    if (!setting.valid) {
                        // setting didn't validate, so allValid can't be true
                        // because there is at least one setting that isn't valid.
                        allValid = false;
                        break; // no need to run other validators
                    }
                }
            } else {
                setting.valid = true;
            }
        }
    });
    return allValid;
}

// requiredValidator will false if the setting has no value and the
// and the setting is required. Otherwise it returns true.
function requiredValidator(setting) {
    if (setting.property.value === null && setting.required) {
        // if setting is required and there is no value set for it
        // then mark as invalid.
        setting.errorMessage = setting.property.name + " is required.";
        return false;
    }
    return true;
}