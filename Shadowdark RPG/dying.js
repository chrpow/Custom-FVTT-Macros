dying();

async function dying(options = {}) {
  /* Ensure exactly one PC token is selected */
  if (canvas.tokens.controlled.length < 1)
    return ui.notifications.warn("No player character token is selected.");
  if (canvas.tokens.controlled.length > 1)
    return ui.notifications.warn("Only 1 token should be selected");
  let actor = canvas.tokens.controlled[0].actor;
  if (actor.type != "Player")
    return ui.notifications.warn("Please select a player character.");

  /* Make sure an encounter is ongoing */
  if (!game.combats.active.active || !game.combats.active.started)
    return ui.notifications.warn("This macro only works during an encounter.");

  const data = {
    actor: actor,
    rollType: "dying",
    conBonus: actor.system.abilities.con.mod,
  };

  const adv = false;
  const parts = [`1d4`, `@conBonus`];
  options.fastForward = true;
  options.chatMessage = true;
  options.title = "Dying";
  options.flavor = options.title;
  options.speaker = ChatMessage.getSpeaker({ actor: actor });
  options.chatCardTemplate = "systems/shadowdark/templates/chat/roll-card.hbs";
  options.rollMode = CONST.DICE_ROLL_MODES.PUBLIC;

  /* Evaluate roll */
  const rollData = await CONFIG.DiceSD._rollAdvantage(parts, data, adv);
  data.rolls = { main: rollData };

  /* Post dice roll to chat */
  await CONFIG.DiceSD._renderRoll(data, adv, options);

  /* Compare result to current turn */
  const result = rollData.roll.total;
  let dyingRound = game.combats.active.round + result;

  /* Post result to chat */
  let message = `${actor.name} will <b>die</b> in <b>${result} rounds</b> (Round ${dyingRound}).`;

  const chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: message,
  };

  await ChatMessage.create(chatData, {});
}