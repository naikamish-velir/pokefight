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
//TODO: this regex is too greedy, it's matching the "X fight Y" command
app.message(/^:pokemon-(.*?):$/, async ({ context, say }) => {
    const mon = GameMaster.getPokemonById(context.matches[1]);

    if(Battle.getPokemon()[0])
    {
        Battle.setNewPokemon(mon, 1, true);
        
        doFight(say);
    }
    else{
        Battle.setNewPokemon(mon, 0, true);
        await say(`:pokemon-${mon.speciesId}: is ready to fight!`);
    }
});
app.message("pokefight go", async ({ message, say, context, client }) => {
    var random = Math.floor(Math.random() * 251);
    const mon = GameMaster.getPokemonByIndex(random);
    const result = await client.users.info({
        user: message.user,
     });
     const selectedUser = result.user.profile.display_name;

    if(Battle.getPokemon()[0])
    {
        Battle.setNewPokemon(mon, 1, true);
        
        await say(`${selectedUser} sends out :pokemon-${mon.speciesId}:`);
       doFight(say);
    }
    else{
        Battle.setNewPokemon(mon, 0, true);
        await say(`${selectedUser} wants to battle!`);
        await say(`${selectedUser} sends out :pokemon-${mon.speciesId}:`);
    }
});

 async function doFight(say)
{
    await say(`:pokemon-${Battle.getPokemon()[0].speciesId}: fights :pokemon-${Battle.getPokemon()[1].speciesId}:`);
    Battle.simulate();

    await say(`:pokemon-${Battle.getWinner().pokemon.speciesId}: wins`);
    await say (`full log can be found at https://pvpoke.com/battle/1500/${Battle.getPokemon()[0].speciesId}/${Battle.getPokemon()[1].speciesId}/00/${Battle.getPokemon()[0].generateURLMoveStr()}/${Battle.getPokemon()[1].generateURLMoveStr()}`)
    

    Battle.clearPokemon();
}

app.message(/^:pokemon-(.*?): fight :pokemon-(.*?):$/, async ({ context, say }) => {
    // say() sends a message to the channel where the event was triggered
    const mon1  = GameMaster.getPokemonById(context.matches[1]);
    const mon2 = GameMaster.getPokemonById(context.matches[2]);

    Battle.setNewPokemon(mon1, 0, true);
    Battle.setNewPokemon(mon2, 1, true);

    doFight(say);

  });


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  
  GameMaster.loadRankingData( "overall", 1500, "all");

  console.log('⚡️ Bolt app is running!');
})();

