import * as Scenario1 from './scenario1';
import * as Scenario2 from './scenario2';

(async () => { 
    await Scenario1.test();
    await Scenario2.test();
})();
