// Importar las clases necesarias de la librería discord.js
const { REST, Routes } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
// Importar las variables de entorno
require("dotenv").config();

const botToken = process.env.BOT_TOKEN; // Token del bot
const appID = process.env.APPLICATION_ID; // ID de la aplicación

// Define una lista de comandos slash
const commands = [
  {
    name: "random_game", // Nombre del comando
    description: "Get a random game from current deals!", // Descripción del comando
  },
  {
    name: "free_game",
    description: "Get a list of games that are currently 100% off!",
  },
  // Utiliza SlashCommandBuilder para crear un comando con más flexibilidad
  new SlashCommandBuilder().setName("settings").setDescription("Show settings").toJSON(),
  {
    name: "about",
    description: "Show information about the DealHunter bot.",
  },
  {
    name: "invite",
    description: "Invite the DealHunter bot to your own server!",
  },
];

// Crea una instancia de la clase REST (biblioteca de Discord.js) y establece el token del bot
const rest = new REST({ version: "10" }).setToken(botToken);

try {
  console.log("Started refreshing application (/) commands."); // Mensaje de inicio de la actualización de comandos

  (async () => {
    // Hace una solicitud PUT a la API de Discord para actualizar los comandos de la aplicación
    await rest.put(Routes.applicationCommands(appID), { body: commands });
  })();

  console.log("Successfully reloaded application (/) commands."); // Mensaje de éxito al actualizar los comandos
} catch (error) {
  console.error(error); // Muestra un mensaje de error si la actualización falla
}
