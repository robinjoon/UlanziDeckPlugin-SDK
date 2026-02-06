
import { UlanzideckApi } from './actions/plugin-common-node/index.js';
import RunAppleScript from './actions/RunAppleScript.js';

const ACTION_CACHES = {};
const $UD = new UlanzideckApi();

$UD.connect('com.ulanzi.ulanzideck.applescript');
$UD.onConnected(conn => {});

$UD.onAdd(jsn => {
  const context = jsn.context;
  const instance = ACTION_CACHES[context];
  if (!instance) {
    const uuid = jsn.uuid;
    if (uuid === 'com.ulanzi.ulanzideck.applescript.run') {
      ACTION_CACHES[context] = new RunAppleScript(context, $UD);
    }
    if (jsn.param) {
      ACTION_CACHES[context].setParams(jsn.param);
    }
  } else {
    instance.add();
  }
});

$UD.onSetActive(jsn => {
  const context = jsn.context;
  const instance = ACTION_CACHES[context];
  if (instance) {
    if (typeof instance.setActive === 'function') instance.setActive(jsn.active);
  }
});

$UD.onRun(jsn => {
  const context = jsn.context;
  const instance = ACTION_CACHES[context];
  if (!instance) {
    $UD.emit('add', jsn);
  } else {
    if (typeof instance.run === 'function') instance.run(jsn);
  }
});

$UD.onClear(jsn => {
  if (jsn.param) {
    for (let i = 0; i < jsn.param.length; i++) {
      const context = jsn.param[i].context;
      const instance = ACTION_CACHES[context];
      if (instance && typeof instance.clear === 'function') instance.clear();
      delete ACTION_CACHES[context];
    }
  }
});

$UD.onParamFromApp(jsn => {
  onSetParams(jsn);
});

$UD.onParamFromPlugin(jsn => {
  onSetParams(jsn);
});

function onSetParams(jsn) {
  const settings = jsn.param || {};
  const context = jsn.context;
  const instance = ACTION_CACHES[context];
  if (!settings || !instance || JSON.stringify(settings) === '{}') return;
  if (typeof instance.setParams === 'function') instance.setParams(settings);
}
