# 10 — STOP CONDITIONS

## Immediate STOP

Stop the Elaris operation immediately if **any** of the following occurs:

- university contact or robot operator says STOP;
- unexpected robot movement occurs;
- Elaris appears to send or trigger a robot command;
- command/control publishing appears in the active path;
- wrong robot is connected;
- wrong network/interface is being used;
- scope/authorization is unclear or exceeded;
- unexpected camera/audio/personal data appears;
- unrelated network traffic is being collected;
- disk write/finalization fails;
- encryption cannot be guaranteed;
- capture cannot be finalized reliably;
- the robot/runtime differs materially from assumptions and the university requests re-review;
- the operator cannot retain control of the robot;
- any participant identifies a safety/security concern.

## What STOP means

1. Stop/terminate the Elaris inspect/capture command.
2. Do not attempt a workaround that expands scope.
3. Keep robot control with the university operator.
4. Record time and reason.
5. Do not restart until the issue is understood and the human Go / No-Go gate is repeated.
6. If a partial capture exists, keep it local and NOT_APPROVED.
7. Do not upload the partial capture.

## Never solve a field problem by

- enabling `rt/lowcmd`;
- enabling `rt/arm_sdk`;
- adding a publisher;
- disabling a safety mechanism;
- scanning unrelated networks;
- copying credentials into source code;
- switching to a different robot without authorization;
- silently increasing capture scope.

## Stop authority

University stop contact: __________________

University robot operator: __________________

Elaris Technical Operator: __________________

Elaris Session Recorder: __________________
