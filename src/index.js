//Importar las clases necesarias de la librería discord.js
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");
const { getFreeGames, searchGame, searchGameInfo } = require("./Services/AsyncFunctions"); // Importar las funciones asincrónicas
const storesArray = require("./Services/StoresArray"); // Importar el array de las plataformas de juegos
const cron = require("node-cron"); // Importar la librería node-cron para programar tareas
const fs = require("fs"); // Importar la librería fs (File System) para trabajar con archivos (leer, escribir, etc...)
const path = require("path"); // Importar la librería path para trabajar con rutas de archivos (agregar, quitar, etc...)
// Importar las funciones de los comandos
const handleRandomGame = require("./Commands/randomGame");
const handleFreeGame = require("./Commands/freeGame");
const { handleSettings } = require("./Commands/settings");
const handleAbout = require("./Commands/about");
const handleInvite = require("./Commands/invite");
// Importar las variables de entorno
require("dotenv").config();

// Crea una nueva instancia del cliente de Discord
const client = new Client({
  // Define los eventos necesarios para el bot (recibir mensajes, eventos relacionados con servidores, etc...)
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

let announcedGames = new Set(); // Crea un nuevo Set para almacenar los juegos anunciados (para no repetirlos)
let notificationRoles = {}; // Crea un objeto vacío para almacenar los roles de notificación
let notificationChannels = {}; // Crea un objeto vacío para almacenar los canales de notificación

// Función para cargar datos desde archivos JSON
const loadJsonFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    // Verifica si el archivo existe
    const data = fs.readFileSync(filePath, "utf-8"); // Lee el archivo
    // Verifica si el archivo tiene contenido
    if (data.trim()) {
      try {
        return JSON.parse(data); // Devuelve el contenido del archivo parseado a JSON
      } catch (error) {
        console.error(`Error parsing JSON from ${filePath}:`, error); // Muestra un mensaje de error si no se puede parsear el JSON
      }
    }
  }
  // Devuelve null si no se puede leer el archivo o no tiene contenido
  return null;
};

// Función para guardar datos en archivos JSON
const saveJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); // Escribe el contenido en el archivo
  } catch (error) {
    console.error(`Error writing JSON to ${filePath}:`, error); // Muestra un mensaje de error si no se puede escribir el JSON
  }
};

announcedGames = new Set(loadJsonFile(path.join(__dirname, "./JsonData/freeAnnouncedGames.json")) || []); // Carga los juegos gratuitos anunciados
notificationRoles = loadJsonFile(path.join(__dirname, "./JsonData/notificationRoles.json")) || {}; // Carga los roles de notificación
notificationChannels = loadJsonFile(path.join(__dirname, "./JsonData/notificationChannels.json")) || {}; // Carga los canales de notificación

// Crear un evento para manejar las interacciones (objeto que tiene info sobre el tipo, usuario, canal, etc...) del bot
client.on("interactionCreate", async (interaction) => {
  try {
    // Verifica si la interacción es un botón
    if (interaction.isButton()) {
      await handleButton(interaction); // Llama a la función asincrona para manejar el botón
      // Verifica si la interacción es un menú de selección
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction); // Llama a la función asincrona para manejar el menú de selección
      // Verifica si la interacción es un comando
    } else if (interaction.isCommand()) {
      await handleCommandInteraction(interaction); // Llama a la función para manejar el comando
    }
  } catch (error) {
    await interaction.reply({ content: "There was an error while handling this interaction.", ephemeral: true }); // Responde con un mensaje de error que solo el usuario puede ver
  }
});

// Función para manejar los botones
const handleButton = async (interaction) => {
  try {
    const { customId } = interaction; // Obtiene el ID del botón

    // Verifica si el ID personalizado es "setfreeGameNotification"
    if (customId === "setfreeGameNotification") {
      // Obtiene los roles del servidor y los mapea
      const roles = interaction.guild.roles.cache.map((role) => ({
        label: role.name, // Nombre del rol
        value: role.id, // ID del rol
        emoji: "🔹", //Emoji de un rombo (no sabía que poner)
      }));

      let embed = new EmbedBuilder() // Crea un nuevo embed (es como un card de información)
        .setTitle("Free games notification!") // Título del embed
        .setDescription("Here you can change the settings of the role notification of free games!"); // Descripción del embed

      const selectMenu = new StringSelectMenuBuilder() // Crea un nuevo menú select
        .setCustomId("selectRole") // ID del menú
        .setPlaceholder("Choose an option") // Placeholder del menú
        .addOptions([
          // Opciones al menú
          {
            label: "Quit notifications", // Nombre de la opción
            description: "You will no longer be pinged for notifications from the bot.", // Descripción de la opción
            value: "quitNotifications", // Valor de la opción
            emoji: "❌", // Emoji de una X
          },
          ...roles, // Desestructuracion de los roles del servidor creados anteriormente
        ]);

      const rowSelect = new ActionRowBuilder().addComponents(selectMenu); // Agrega el menú a una fila de acción (contenedor para componentes interactivos de discord)
      const backButton = new ButtonBuilder().setCustomId("backToMenu").setLabel("Back").setStyle(ButtonStyle.Secondary); // Crea un botón para volver atrás
      const rowButton = new ActionRowBuilder().addComponents(backButton); // Agrega el botón a una fila de acción

      await interaction.update({ embeds: [embed], components: [rowSelect, rowButton] }); // Actualiza la interacción incluyendo el embed y los componentes
      // Verifica si el ID personalizado es "setChannelNotification"
    } else if (customId === "setChannelNotification") {
      const channels = interaction.guild.channels.cache // Obtiene los canales del servidor
        .filter((channel) => channel.type === 0) // Filtra los canales que sean de texto (type 0) == GUILD_TEXT
        // Mapea los canales
        .map((channel) => ({
          label: channel.name, // Nombre del canal
          value: channel.id, // ID del canal
          description: `Select ${channel.name} for notifications`, // Descripción del canal
        }));

      let embed = new EmbedBuilder() // Crea un nuevo embed
        .setTitle("Set Notification Channel") // Título del embed
        .setDescription("Please select the channel where you want to receive notifications:"); // Descripción del embed

      const selectMenu = new StringSelectMenuBuilder() // Crea un nuevo menú select
        .setCustomId("selectChannel") // ID del menú
        .setPlaceholder("Choose a channel") // Placeholder del menú
        .addOptions([
          // Opciones al menú
          {
            label: "Quit notifications", // Nombre de la opción
            description: "You will no longer receive notifications of free games in any channel", // Descripción de la opción
            value: "quitNotifications", // Valor de la opción
            emoji: "❌", // Emoji de una X
          },
          ...channels, // Desestructuracion de los canales del servidor creados anteriormente
        ]);

      const rowSelect = new ActionRowBuilder().addComponents(selectMenu); // Agrega el menú a una fila de acción
      const backButton = new ButtonBuilder().setCustomId("backToMenu").setLabel("Back").setStyle(ButtonStyle.Secondary); // Crea un botón para volver atrás
      const rowButton = new ActionRowBuilder().addComponents(backButton); // Agrega el botón a una fila de acción

      await interaction.update({ embeds: [embed], components: [rowSelect, rowButton] }); // Actualiza la interacción incluyendo el embed y los componentes
      // Verifica si el ID personalizado es "backToMenu"
    } else if (customId === "backToMenu") {
      // Crea la misma interfaz de configuración del inicio, con los botones para configurar los roles y canales de notificación que tiene settings.js
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("setfreeGameNotification").setLabel("Set role notifications").setStyle(ButtonStyle.Primary), // Botón para configurar notificaciones
        new ButtonBuilder().setCustomId("setChannelNotification").setLabel("Change channel notification").setStyle(ButtonStyle.Primary) // Botón para configurar canales de notificación
      );

      const embed = new EmbedBuilder() // Crea un nuevo embed
        .setColor("#0099ff") // Color del embed
        .setTitle("DealHunter Settings") // Título del embed
        .setDescription("Welcome back! Click on a button to change the settings you want!"); // Descripción del embed

      await interaction.update({ embeds: [embed], components: [row] }); // Actualiza la interacción incluyendo el embed y los componentes
    }
  } catch (error) {
    console.error("Error handling button interaction:", error);
    await interaction.reply({ content: "There was an error while handling this button interaction.", ephemeral: true }); // Responde con un mensaje de error
  }
};

// Función para manejar las interacciones del select
const handleSelectMenu = async (interaction) => {
  try {
    const { customId, guildId } = interaction; // Obtiene el ID personalizado y el ID del servidor
    const selectedValue = interaction.values[0]; // Obtiene el valor seleccionado del menú

    // Verifica si el ID es "selectRole"
    if (customId === "selectRole") {
      let replyMessage = ""; // Mensaje de respuesta
      // Verifica si el valor seleccionado es "quitNotifications"
      if (selectedValue === "quitNotifications") {
        delete notificationRoles[guildId]; // Elimina el rol de notificación del objeto
        replyMessage = "You have successfully quit notifications for free games."; // Mensaje de confirmación
      } else {
        // Sino
        notificationRoles[guildId] = selectedValue; // Asigna el rol seleccionado al servidor en el objeto
        const role = interaction.guild.roles.cache.get(selectedValue); // Obtiene el rol seleccionado del servidor
        replyMessage = `You will now receive notifications for free games with the role: ${role.name}`; // Mensaje de respuesta con el nombre del rol
      }
      saveJsonFile(path.join(__dirname, "./JsonData/notificationRoles.json"), notificationRoles); // Guarda los roles de notificación del objeto en el archivo JSON correspondiente
      await interaction.reply({ content: replyMessage, ephemeral: true }); // Responde con el mensaje de confirmación (solo visible para el usuario)
      // Verifica si el ID es "selectChannel"
    } else if (customId === "selectChannel") {
      let replyMessage = ""; // Mensaje de respuesta
      // Verifica si el valor seleccionado es "quitNotifications"
      if (selectedValue === "quitNotifications") {
        delete notificationChannels[guildId]; // Elimina el canal de notificación del objeto
        replyMessage = "You have successfully quit notifications for free games in any channel."; // Mensaje de confirmación
      } else {
        notificationChannels[guildId] = selectedValue; // Asigna el canal seleccionado al servidor en el objeto
        const channel = interaction.guild.channels.cache.get(selectedValue); // Obtiene el canal seleccionado del servidor
        replyMessage = `You will now receive notifications for free games in the channel: ${channel.name}`; // Mensaje de respuesta con el nombre del canal
      }
      saveJsonFile(path.join(__dirname, "./JsonData/notificationChannels.json"), notificationChannels); // Guarda los canales de notificación del objeto en el archivo JSON correspondiente
      await interaction.reply({ content: replyMessage, ephemeral: true }); // Responde con el mensaje de confirmación (solo visible para el usuario)
    }
  } catch (error) {
    console.error("Error handling command interaction:", error);
    await interaction.reply({ content: "There was an error while handling this command interaction.", ephemeral: true }); // Responde con un mensaje de error (solo visible para el usuario)
  }
};

// Función para manejar las interacciones de los comandos
const handleCommandInteraction = async (interaction) => {
  const { commandName } = interaction; // Obtiene el nombre del comando

  // Verifica el nombre del comando
  if (commandName === "random_game") {
    await handleRandomGame(interaction); // Llama a la función asincrónica de handleRandoGame para manejar el comando
  } else if (commandName === "free_game") {
    await handleFreeGame(interaction); // Llama a la función asincrónica de handleFreeGame para manejar el comando
  } else if (commandName === "settings") {
    await handleSettings(interaction); // Llama a la función asincrónica de handleSettings para manejar el comando
  } else if (commandName === "about") {
    await handleAbout(interaction); // Llama a la función asincrónica de handleAbout para manejar el comando
  } else if (commandName === "invite") {
    await handleInvite(interaction); // Llama a la función asincrónica de handleInvite para manejar el comando
  }
};

// Tarea programada para buscar juegos gratis y notificarlos
client.once("ready", () => {
  console.log(`¡Listo! Conectado como ${client.user.tag}`); // Muestra un mensaje en consola indicando que el cliente está listo

  cron.schedule("0 */2 * * *", async () => {
    // Programa la tarea para ejecutarse cada 2 horas
    console.log("Tarea programada ejecutada");

    try {
      const games = await getFreeGames(); // Obtiene los juegos gratuitos
      const newGames = games.filter((game) => !announcedGames.has(game.dealID)); // Filtra los juegos que no han sido anunciados
      // Verifica si hay juegos nuevos
      if (newGames.length > 0) {
        // Recorre los juegos nuevos
        for (const game of newGames) {
          const gameSearchResult = await searchGame(game.title); // Busca el juego por título
          const gameInfo = await searchGameInfo(gameSearchResult.results[0].id); // Obtiene la información del juego con el ID
          const store = storesArray.find((store) => store.storeID === game.storeID); // Busca la tienda del juego

          const embed = new EmbedBuilder() // Crea un nuevo embed
            .setDescription(`[**${game.title}**](https://www.cheapshark.com/redirect?dealID=${game.dealID})`) // Descripción del embed
            .addFields(
              // Campos del embed
              { name: "Free to play!", value: "\u200B", inline: true },
              { name: "Normal Price:", value: `~~${game.normalPrice}€~~`, inline: true }
            )
            .setAuthor({ name: store.storeName, iconURL: `https://www.cheapshark.com/img/stores/logos/${store.banner}` }) // Logo de la tienda
            .setImage(gameInfo ? gameInfo.background_image : "../img/logo_DealHunter-bg.png") // Imagen del juego
            .setFooter({ text: "Powered by RAWG.io and CheapShark.com" }); // Pie de página

          // Recorre los servidores del cliente para enviar notificaciones a los canales configurados
          for (const [guildId] of client.guilds.cache) {
            console.log("guildId", guildId);
            const channelId = notificationChannels[guildId]; // Obtiene el ID del canal de notificación
            // Verifica si existe el ID del canal de notificación
            if (channelId) {
              const channel = await client.channels.fetch(channelId); // Obtiene el canal de notificación
              const notificationRole = notificationRoles[guildId]; // Obtiene el rol de notificación
              // Verifica si existe el rol de notificación
              if (notificationRole) {
                await channel.send({ content: `<@&${notificationRole}>`, embeds: [embed] }); // Envia la notificación con el rol mencionado
                // Sino
              } else {
                await channel.send({ embeds: [embed] }); // Envia la notificación sin mencionar el rol
              }
              // Sino
            } else {
              console.log(`No channel ID found for guild ID: ${guildId}`); // Muestra un mensaje en consola si no se encuentra el ID del canal
            }
          }

          announcedGames.add(game.dealID); // Agrega el ID del juego anunciado al Set de juegos anunciados una vez notificado
        }
        saveJsonFile(path.join(__dirname, "./JsonData/freeAnnouncedGames.json"), Array.from(announcedGames)); // Guarda los juegos anunciados actualizados en el archivo JSON correspondiente
      }
    } catch (error) {
      console.error("Error fetching free games:", error); // Muestra un mensaje de error si no se pueden obtener los juegos gratuitos
    }
  });
});

// Iniciar sesión en Discord con el token de tu cliente
const botToken = process.env.BOT_TOKEN; // Obtiene el token del bot desde las variables de entorno
client.login(botToken); // Inicia sesión en Discord con el token del bot
