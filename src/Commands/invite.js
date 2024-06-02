// Importar la clase necesaria de la librería discord.js
const { EmbedBuilder } = require("discord.js");

// Función asíncrona para manejar el comando /invite
const handleInvite = async (interaction) => {
  try {
    const embed = new EmbedBuilder() // Crea un nuevo objeto EmbedBuilder
      .setColor("#5865F2") // Establece el color del embed a azul de Discord
      .setTitle("Invite DealHunter Bot") // Establece el título del embed
      .setDescription("[Click here to add the bot to your server](https://discord.com/oauth2/authorize?client_id=1220283733400092692)") // Establece la descripción del embed (enlace)
      .setThumbnail("https://yiyangji.github.io/dealhunter/img/logo_DealHunter-nobg.png") // Establece una miniatura para el embed
      .setFooter({ text: "DealHunter Bot", iconURL: "https://yiyangji.github.io/dealhunter/img/logo_DealHunter-nobg.png" }); // Establece el pie de página del embed

    await interaction.reply({ embeds: [embed] }); // Devuelve el embed al canal de texto
  } catch (error) {
    console.error("Error handling invite command:", error);
    await interaction.reply({ content: "There was an error while processing your command.", ephemeral: true }); // Devuelve un mensaje de error al usuario si ocurre un error (solo visible para el usuario)
  }
};

module.exports = handleInvite; // Exporta la función handleInvite para que pueda ser utilizada en otros archivos
