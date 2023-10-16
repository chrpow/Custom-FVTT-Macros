awardXP();

async function awardXP() {
    /* Collect all player-controlled actors */
    const pcs = [];
    game.users.players.forEach(p => {if (pcs.indexOf(p.character) == -1 && p.character) {pcs.push(p.character)}})

    /* Throw warning if no available player characters*/
    if (pcs.length < 1) { return ui.notifications.warn('No player characters are assigned!'); }

    /* Build dialog data */
    const xpMap = new Map([
        //[0, 'Poor'],
        [1, 'Normal'],
        [3, 'Fabulous'],
        [10, 'Legendary']
    ]);

    const es_data = [
        { label: `Treasure Quality:`, type: `select`, options: [] },
    ];

    for (let actor of pcs) {
        es_data.push({label: actor.name, type: `checkbox`, options: [game.users.players.find(p => p.character === actor).active ? 'checked' : '']})
    }
    es_data.push()
    xpMap.forEach((value, key) => {
        es_data[0].options.push([key, value])
    })

    /* Run dialog and allot data */
    const choice = await quickDialog({ data: es_data, title: `Award XP` });
    const xpGain = choice[0];
    checks = [...choice];
    checks.splice(0,1);
    selectedActors = [];

    for (let i = 0; i < checks.length; i++) {
        if (checks[i]) {selectedActors.push(pcs[i])}
    } 
    const dingers = [];

    for (let actor of selectedActors) {
        let initLevel = actor.system.level.value;
        let initXP = actor.system.level.xp;
        actor.system.level.xp = actor.system.level.xp + 1 * xpGain;
        while (actor.system.level.xp >= 10 * actor.system.level.value) {
            actor.system.level.xp -= 10 * actor.system.level.value;
            actor.system.level.value++;
            dingers.push([actor.uuid, actor.name, actor.system.level.value])
        }
        let newLevel = actor.system.level.value;
        let newXP = actor.system.level.xp;
        console.log(`${actor.name}: LVL${initLevel}/${initXP}XP ==> LVL${newLevel}/${newXP}XP`)
    }

    /* Post message to chat */
    message = `<h2><p>The party was awarded ${xpGain} XP!</p></h2>`;
    dingers.forEach((x) => { message += `<p>@UUID[${x[0]}]{${x[1]}} is now Level ${x[2]}!</p>`; })

    const chatData = {
        user: game.user._id,
        //speaker: ChatMessage.getSpeaker(),
        content: message,
    };

    ChatMessage.create(chatData, {});
}
/* Dialog box */
async function quickDialog({ data, title = `Quick Dialog` } = {}) {
    data = data instanceof Array ? data : [data];

    return await new Promise(async (resolve) => {
        let content = `
        <table style="border-collapse:collapse;border-spacing:0;border:none" class="tg"><thead><tr><th style="border-color:inherit;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;font-weight:normal;overflow:hidden;padding:10px 10px;text-align:center;vertical-align:top;word-break:normal">Quality</th><th style="border-color:inherit;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;font-weight:normal;overflow:hidden;padding:10px 10px;text-align:center;vertical-align:top;word-break:normal">XP</th><th style="border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;font-weight:normal;overflow:hidden;padding:10px 10px;text-align:left;vertical-align:top;word-break:normal">Examples</th></tr></thead><tbody><tr><td style="border-color:inherit;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 10px;text-align:center;vertical-align:top;word-break:normal">Poor</td><td style="border-color:inherit;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 10px;text-align:center;vertical-align:top;word-break:normal">0</td><td style="border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 10px;text-align:left;vertical-align:top;word-break:normal">Bag of silver, used dagger, knucklebone dice</td></tr><tr><td style="border-color:inherit;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 10px;text-align:center;vertical-align:top;word-break:normal">Normal</td><td style="border-color:inherit;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 10px;text-align:center;vertical-align:top;word-break:normal">1</td><td style="border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 10px;text-align:left;vertical-align:top;word-break:normal">Bag of gold, gem, fine armor, magic scroll</td></tr><tr><td style="border-color:inherit;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 10px;text-align:center;vertical-align:top;word-break:normal">Fabulous</td><td style="border-color:inherit;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 10px;text-align:center;vertical-align:top;word-break:normal">3</td><td style="border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 10px;text-align:left;vertical-align:top;word-break:normal">Magic sword, giant diamond, mithral chainmail</td></tr><tr><td style="border-color:inherit;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 10px;text-align:center;vertical-align:top;word-break:normal">Legendary</td><td style="border-color:inherit;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 10px;text-align:center;vertical-align:top;word-break:normal">10</td><td style="border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 10px;text-align:left;vertical-align:top;word-break:normal">The Staff of Ord, a djinni's wish, a dragon hoard</td></tr></tbody></table>

        <table style="width:100%">
        ${data.map(({ type, label, options }, i) => {
            if (type.toLowerCase() === `select`) {
                return `<tr><th style="width:50%"><label>${label}</label></th><td style="width:50%"><select style="font-size:12px" id="${i}qd">${options.map((e, i) => `<option value="${e[0]}">${e[0]} - ${e[1]}</option>`).join(``)}</td></tr>`;
            }
            else if (type.toLowerCase() === `checkbox`) {
                return `<tr><th style="width:50%"><label>${label}</label></th><td style="width:50%"><input type="${type}" id="${i}qd" ${options || ``}/></td></tr>`;
            }
            else {
                return `<tr><th style="width:50%"><label>${label}</label></th><td style="width:50%"><input type="${type}" id="${i}qd" value="${options instanceof Array ? options[0] : options}"/></td></tr>`;
            }
        }).join(``)}
        </table>`;

        await new Dialog({
            title, content,
            buttons: {
                Ok: {
                    label: `Ok`, callback: (html) => {
                        resolve(Array(data.length).fill().map((e, i) => {
                            let { type } = data[i];
                            if (type.toLowerCase() === `select`) {
                                return html.find(`select#${i}qd`).val();
                            }
                            else {
                                switch (type.toLowerCase()) {
                                    case `text`:
                                    case `password`:
                                    case `radio`:
                                        return html.find(`input#${i}qd`)[0].value;
                                    case `checkbox`:
                                        return html.find(`input#${i}qd`)[0].checked;
                                    case `number`:
                                        return html.find(`input#${i}qd`)[0].valueAsNumber;
                                }
                            }
                        }));
                    }
                }
            },
            default: 'Ok'
        }, { width: "auto" })._render(true);
        document.getElementById("0qd").focus();
    });
}