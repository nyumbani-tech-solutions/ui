---
name: nyumbani-payment-prompt
description: "Invoke when a Nyumbani app lets a payer pay with M-Pesa on screen: the <x-nyumbani::payment-prompt> component, the check route it calls, its states and texts, copying the pay-by-hand details, putting it in a modal, Reverb and the UI_ECHO_* settings, polling without a websocket (mode=poll), the payment-confirmed event, or a payer stuck on a waiting screen. Skip for sending the STK push and receiving the callbacks (see nyumbani-daraja-payments and nyumbani-daraja-webhooks)."
metadata:
  author: nyumbani
---

# Nyumbani Payment Prompt

`<x-nyumbani::payment-prompt>` is the one screen for paying with M-Pesa. It **follows** a push the app already started: the app starts it (a request, Livewire or ajax), and when that succeeds puts the component on the page with the contract it got back. The prompt waits for the status the server broadcasts (or polls the check route, see Polling) and shows how to pay by hand whenever the push does not succeed. Never build another one. It follows over Reverb, or by polling the check route with `mode="poll"`, and needs `nyumbani/daraja` on the server (`StkPushManager`, see `nyumbani-daraja-payments`).

## Use it
```blade
<x-nyumbani::payment-prompt
    :attempt="$attempt"
    :check-url="route('invoices.pay.check', ['invoice' => $invoice])"
    :redirect="route('invoices.show', ['invoice' => $invoice])"
/>
```
- `attempt` is required: the contract `$stkPush->contract($attempt)` returns (`id`, `channel`, `status`, `reason`, `phone`, `timeout`, `manual`).
- `check-url` receives `{ id }` and answers with the contract again. It backs the "I have paid, check" button (needs `StkPushManager::resolvePaymentUsing()`) and catches up on a status that changed before the page subscribed. Without it there is no button.
- `:pushed="false"` is for a payment nobody was prompted for (`$stkPush->track()`): it shows how to pay and waits for the payment.
- `redirect` moves on about a second after a confirmed payment. The component also dispatches `payment-confirmed` from its element (`detail.id`), so a page can react with `x-on:payment-confirmed`. That event is for the screen only.
- `mode` is `websocket` or `poll` (default: `websocket` when Reverb is set up, else `poll`); `interval` is the seconds between polls (3) and `duration` how long it keeps polling (300). All three default to the attempt's contract, which nyumbani/daraja fills from `daraja.stk.mode`, `poll_interval` and `poll_duration`, so set them there for the whole app and use the props only for one page. See Polling.
- `timeout` overrides the waiting time (it defaults to the `timeout` in the contract, from `DARAJA_STK_TIMEOUT`, 120); `confirm-timeout` is how long a paid push waits for its confirmation before saying so (30).

## It never starts a push and never retries
There is no initiate URL, no phone input, no Pay button and no Try again button. After a failure the payer pays by hand, or the page starts a new push (from the app) and renders a new prompt. Do not add a retry: it was removed on purpose, because it put request handling in the component.

## States
One screen covers `pending`, `paid` and `confirmed`, so a confirmed payment reads as the next beat of the one before: the dots turn into a tick in the same place.
- `pending`: "Watch out for an MPESA PIN prompt on your phone!", eight turning dots, the number prompted and the amount in bold, a draining bar and a countdown in seconds to when the manual instructions show.
- `paid`: "Payment received", still confirming; after `confirm-timeout` seconds it says the payment arrived and must not be repeated. The manual instructions are never shown after a paid push.
- `confirmed`: "Payment confirmed", then the redirect.
- `timed-out` (no heading, set by the screen when the countdown ends) and `failed` ("Payment failed" with the reason): the short pay-by-hand card.
- `manual`: the same card for a payment nobody was prompted for.

## Pay by hand
A small card: open M-PESA, choose Pay Bill, then the business number, account number and amount, each tap to copy. "Already paid? Do not pay again" sits under the "I have paid, check" button, a pulsing dot says the prompt is still listening (a payment made by hand moves it to confirmed by itself), and a notice at the top says when a check found nothing.
- Copying works on plain http too: without a secure context the prompt copies through a hidden field inside itself (inside the prompt so a modal's focus trap allows it). A toast, from the UI bundle's toastr, says "Copied to clipboard".
- Keep the wording short. All texts are built in `PaymentPrompt::texts()` through `__()`; change a sentence there, in one place, and translate it in `lang/{code}.json`.

## Theme
Use only the theme's primary colour, greys and white. Do not add green, amber or red for states.

## In a modal
Put it inside `<x-nyumbani::modal>` with a `p-4` body. The prompt keeps working because it listens by itself.

## Polling
Set `DARAJA_STK_MODE=poll` (or pass `mode="poll"`, `:interval="3"` and `:duration="300"`, in seconds) to follow the payment without a websocket: the prompt asks the `check-url` (required) on the interval until the payment is confirmed, the duration is up or the prompt leaves the page, and skips rounds while the tab is hidden. Without `mode` it polls only when Reverb is not set up; `daraja.stk.check_throttle` keeps the resolver from being hammered.

## Reverb
The default `websocket` mode throws a `LogicException` without Reverb settings. It reads `config('ui.broadcasting')`, which defaults to `REVERB_APP_KEY`, `REVERB_HOST`, `REVERB_PORT` and `REVERB_SCHEME`; set `UI_ECHO_KEY`, `UI_ECHO_HOST`, `UI_ECHO_PORT` and `UI_ECHO_SCHEME` only when the browser reaches Reverb differently from the server. Run `php artisan reverb:start` (add `--debug` to see connections and events) and a queue worker, since the broadcast is queued. Echo and Pusher are bundled in `resources/dist`, load only when a prompt is on the page, and reuse `window.Echo` when the app made one.

## Rules
- The event channel is public and named after the attempt's UUID, so the UUID is the only secret: never log it, and never put a phone or receipt in the broadcast.
- Fulfil orders on the server, from the C2B payment you recorded, never on the browser's `payment-confirmed`.
- After changing `packages/ui/resources/js/payment-prompt.js`, run `npm run build` in `packages/ui` and in the app, and commit `resources/dist`.

## When it looks wrong
| You see | Because | Do |
| --- | --- | --- |
| "We lost the connection" after 8 seconds | The browser could not subscribe to Reverb | Start Reverb, check `REVERB_*` or `UI_ECHO_*` |
| No `check` requests while polling | The page runs an old bundle, or the attempt was started before `DARAJA_STK_MODE` was set (the contract carries the mode) | Run `npm run build` in `packages/ui` and in the app, then start a new push |
| Waiting never moves on | The STK result never reached the app | Use a tunnel, or `DARAJA_STK_SIMULATE` and answer from the simulator panel on the STK push page of the Daraja docs |
| Confirmed at once with no payment | A resolver confirmed it from an old payment | Make the resolver check the amount and that the payment is newer |
| Wrong countdown | The contract carries the timeout it was built with | Set `DARAJA_STK_TIMEOUT` and start a new push, or pass `:timeout` |
