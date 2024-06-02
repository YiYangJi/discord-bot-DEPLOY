// Importar la clase necesaria de la librería discord.js
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require("discord.js");

// Función asíncrona para manejar el comando /settings
const handleSettings = async (interaction) => {
  try {
    const row = new ActionRowBuilder().addComponents(
      // Crea una fila de botones con dos botones
      // Boton para cambiar la notificación de roles de juegos gratuitos
      new ButtonBuilder().setCustomId("setfreeGameNotification").setLabel("Set role notifications").setStyle(ButtonStyle.Primary),
      // Boton para cambiar la notificación de canal de juegos gratuitos
      new ButtonBuilder().setCustomId("setChannelNotification").setLabel("Change channel notification").setStyle(ButtonStyle.Primary)
    );

    const embed = new EmbedBuilder() // Crea un nuevo objeto EmbedBuilder
      .setColor("#0099ff") // Establece el color del embed a azul
      .setTitle("DealHunter Settings") // Establece el título del embed
      .setDescription("Welcome back! Click on a button to change the settings you want!"); // Establece la descripción del embed

    await interaction.reply({ embeds: [embed], components: [row] }); // Devuelve el embed y la fila de botones al canal de texto
  } catch (error) {
    console.error("Error handling settings command:", error);
    await interaction.reply({ content: "There was an error while processing your command.", ephemeral: true }); // Devuelve un mensaje de error al usuario si ocurre un error (solo visible para el usuario)
  }
};

module.exports = { handleSettings }; // Exporta la función handleSettings para que pueda ser utilizada en otros archivos
