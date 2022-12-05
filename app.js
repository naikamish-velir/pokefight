import pkg from '@slack/bolt';
const { App } = pkg;
import { config } from 'dotenv';
import GameMaster from './pvpoke/js/GameMaster.js';
import Battle from './pvpoke/js/battle/Battle.js'

config();

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true, // add this
    appToken: process.env.SLACK_APP_TOKEN // add this
});
app.message(/^:pokemon-(.*?):$/, async ({ context, say }) => {
    const mon = GameMaster.getPokemonById(context.matches[1]);

    if(Battle.getPokemon()[0])
    {
        Battle.setNewPokemon(mon, 1, true);
        
        await say(`:pokemon-${Battle.getPokemon()[0].speciesId}: fights :pokemon-${mon.speciesId}:`);
        Battle.simulate();

        await say(`:pokemon-${Battle.getWinner().pokemon.speciesId}: wins`);

        Battle.clearPokemon();
    }
    else{
        Battle.setNewPokemon(mon, 0, true);
        await say(`:pokemon-${mon.speciesId}: is ready to fight!`);
    }
});

app.message(/^:pokemon-(.*?): fight :pokemon-(.*?):$/, async ({ context, say }) => {
    // say() sends a message to the channel where the event was triggered
    const mon1  = GameMaster.getPokemonById(context.matches[1]);
    const mon2 = GameMaster.getPokemonById(context.matches[2]);

    await say(`:pokemon-${mon1.speciesId}: fights :pokemon-${mon2.speciesId}:`);
    Battle.setNewPokemon(mon1, 0, true);
    Battle.setNewPokemon(mon2, 1, true);
    Battle.simulate();
    await say(`:pokemon-${Battle.getWinner().pokemon.speciesId}: wins`);
    
    Battle.clearPokemon();

  });


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();

