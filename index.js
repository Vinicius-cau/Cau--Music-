const Discord = require("discord.js")
const { Player, useQueue } = require("discord-player")
const { YoutubeiExtractor } = require("discord-player-youtubei")
const config = require("./config.json")

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildVoiceStates,
    ]
})

const player = new Player(client)

player.extractors.loadDefault(ext => ext !== "YouTubeExtractor")
player.extractors.register(YoutubeiExtractor, {})

player.events.on("playerStart", (queue, track) => {
    queue.metadata.channel.send(`Começando a tocar **${track.cleanTitle}**`)
})

player.events.on("playerSkip", (queue, track) => {
    queue.metadata.channel.send(`**${track.cleanTitle}** pulada`)
})

player.events.on("queueDelete", (queue, track) => {
    queue.metadata.channel.send(`Fila apagada`)
})


client.on(Discord.Events.ClientReady, () => {
    console.log(`${client.user.username} online`)
})

client.on(Discord.Events.MessageCreate, async message => {
    if (message.author.bot) return
    if (!message.content.startsWith(config.prefix)) return

    const args = message.content.trim()
        .slice(config.prefix.length)
        .split(" ")

    const cmd = args.shift().toLocaleLowerCase()

    if (cmd === "play") play(message, args.join(" "))
    if (cmd === "stop") stop(message)
    if (cmd === "skip") skip(message)

})

const play = async (message, query) => {
    const channel = message.member.voice.channel
    if (!channel) return message.channel.send("Você não está em um canal de voz")

    try {
        const { track } = await player.play(channel, query, {
            nodeOptions: {
                metadata: message
            }
        })

        message.channel.send(`**${track.cleanTitle}** adicionado à fila`)
    }
    catch (error) {
        message.channel.send("Deu algum erro: ", error)
    }
}

const stop = async message => {
    const queue = useQueue(message.guildId)
    queue.delete()
}

const skip = async message => {
    const queue = useQueue(message.guildId)
    queue.node.skip()
}

client.login(config.token)