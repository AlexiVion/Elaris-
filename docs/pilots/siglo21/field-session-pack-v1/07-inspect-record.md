# 07 — Live Inspect Record

Complete immediately after `inspect-unitree`.

## Session

- Date/time: __________________
- Robot ID/label: __________________
- Interface: __________________
- Elaris operator: __________________
- University operator/contact: __________________

## Command

~~~bash
pnpm edge inspect-unitree --interface <iface> --hz 20
~~~

## Result

- process exited successfully: YES / NO
- real state frame received: YES / NO
- `rt/lowstate` readable: YES / NO
- transport reported SDK2/DDS: YES / NO
- sampling cap: __________________ Hz
- normalized component count: __________________
- normalized signal type count: __________________

## Signals observed

Record only what the command actually reports:

- __________________
- __________________
- __________________
- __________________

## Component / motor observations

- populated motor slots observed: __________________
- apparently empty/unpopulated slots: __________________
- public 29-slot assumption consistent: YES / NO / UNKNOWN
- left knee/public index mapping requires correction: YES / NO / UNKNOWN
- hand state information observed: __________________
- IMU fields populated: YES / NO / PARTIAL

## Safety observations

- unexpected robot movement during inspect: YES / NO
- command/control behavior observed: YES / NO
- Elaris output stated "No robot command was sent": YES / NO
- data written to disk by inspect: expected NO; observed issue: __________________
- unexpected data category observed: YES / NO
- unexpected personal/audio/video data: YES / NO

## Technical deviations

- topic/channel differs from expectation: __________________
- SDK/runtime differs from expectation: __________________
- frequency/latency issue: __________________
- bridge/process issue: __________________
- other: __________________

## Inspect conclusion

- read-only path credible for bounded capture: YES / NO
- scope still matches authorization: YES / NO
- additional university review needed before capture: YES / NO

Recorder: __________________
