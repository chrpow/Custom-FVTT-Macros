reactionCheck();

async function reactionCheck(options = {}) {
  /* Ensure exactly one PC token is selected */
  if (canvas.tokens.controlled.length < 1)
    return ui.notifications.warn("No player character token is selected.");
  if (canvas.tokens.controlled.length > 1)
    return ui.notifications.warn("Only 1 token should be selected");
  let actor = canvas.tokens.controlled[0].actor;
  if (actor.type != "Player")
    return ui.notifications.warn("Please select a player character.");

  const data = {
    actor: actor,
    rollType: "reaction",
    chaBonus: actor.system.abilities.cha.mod,
  };

  const adv = false;
  const parts = [`2d6`, `@chaBonus`];
  options.fastForward = true;
  options.chatMessage = true;
  options.title = "Reaction Check";
  options.flavor = options.title;
  options.speaker = ChatMessage.getSpeaker({ actor: actor });
  options.chatCardTemplate = "systems/shadowdark/templates/chat/roll-card.hbs";
  options.rollMode = CONST.DICE_ROLL_MODES.PUBLIC;

  /* Evaluate roll */
  const rollData = await CONFIG.DiceSD._rollAdvantage(parts, data, adv);
  data.rolls = { main: rollData };

  /* Post dice roll to chat */
  await CONFIG.DiceSD._renderRoll(data, adv, options);

  /* Compare result to roll table */
  const result = rollData.roll.total;
  let reaction;
  if (result < 7) reaction = "hostile";
  else if (result < 9) reaction = "suspicious";
  else if (result < 10) reaction = "neutral";
  else if (result < 12) reaction = "curious";
  else reaction = "friendly";

  /* Post result to chat */
  let message = `The creatures seem <b>${reaction}</b>.`;

  const chatData = {
    user: game.user._id,
    speaker: {alias: name},
    content: message,
  };

  await ChatMessage.create(chatData, {});
}