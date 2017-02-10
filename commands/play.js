exports.desc = "Begin playing a song (provide a link) OR search for a song to play (query)";
exports.syntax = "play (link OR query)"

var main = require("../bot.js");
var Discord = require("discord.js");
var bot = main.bot;
var config = main.config;
var searchYT = main.searchYT;
var ytdl = main.ytdl;
var musicBotGuilds = main.musicBotGuilds;
var musQueue = main.musQueue;
var musicApplyLink = "xrubyy.xyz/app";

exports.run = function(msg) {
  msg.delete();
  var cmd = config["prefix_" + msg.channel.guild.id];
       var canPlay = false;

       for (var i = 0; i < musicBotGuilds.length && !canPlay; i++) {
         if (musicBotGuilds[i] === msg.guild.id) {
           canPlay = true;
         }
       }


       if (!canPlay) {
         msg.delete();
         msg.reply(":musical_note: :no_entry_sign: Error. This server has not been whitelisted to use the music part of this bot. (Apply for access here: ** " + musicApplyLink + "**) :musical_note:");
         return;
       }

       if (bot.voiceConnections.get(msg.guild.id) == null || bot.voiceConnections.get(msg.guild.id) == undefined) {
          let sender = "";
          if (msg.channel.guild.member(msg.author).nickname == null) {
            sender = msg.author.username;
          } else {
            sender = msg.channel.guild.member(msg.author).nickname;
          }

            const embed = new Discord.RichEmbed()
            .setTitle('')
            .setAuthor( sender, msg.author.avatarURL )
            .setColor(0x00AE86)
            .setDescription('')
            .setFooter('', '')
            .setImage('')
            .setThumbnail( "" )
            .setTimestamp()
            .setURL('')
            .addField('\nError:', "I am not in a voice channel. Initialize me first with " + cmd + "connect")

            msg.channel.sendEmbed(
              embed,
              '',
              { disableEveryone: true }
            );
            return;
       }

       const input = msg.content.replace(cmd + 'play ', '');
       const streamOptions = { seek: 0, volume: 1 };

           // ---------QUEUE ADD------------
           if (input.startsWith("https:") || input.startsWith("www.") || input.startsWith("youtube.com") || input.startsWith("http:")) {

           const voiceChan = msg.member.voiceChannel;
             let url = msg.content.replace(cmd + 'play ', '');
             var sender = "";

             const incUrl = new Discord.RichEmbed()
            .setTitle('-=-=-=-= Error -=-=-=')
            .setAuthor( sender, msg.author.avatarURL )
            .setColor(0x00AE86)
            .setDescription('\n')
            .setFooter('', '')
            .setImage( "" )
            .setThumbnail( )
            .setTimestamp()
            .setURL('')
            .addField("-> Invalid URL", `**${url}** is not a valid YouTube URL.`);
 
            if (msg.channel.guild.member(msg.author).nickname == null) {
              sender = msg.author.username;
            } else {
              sender = msg.channel.guild.member(msg.author).nickname;
            }

             if (url == '' || url === undefined || !url.includes("youtube.com")) {
              msg.channel.sendEmbed(incUrl, '', { disableEveryone:true })
              .then(mesg => {
                setTimeout(function() {
                    mesg.delete();
                }, 10000);
              });
              return;
             }

             ytdl.getInfo(url, (err, info) => {
               if (err) {
                   return msg.channel.sendMessage("***___" + err + "___***");
                 }

               if (url == '' || url === undefined) {
                msg.channel.sendEmbed(incUrl, '', { disableEveryone:true })
                .then(mesg => {
                  setTimeout(function() {
                      mesg.delete();
                  }, 10000);
                });
               }

               if (typeof musQueue[msg.channel.guild.id] == "undefined") {
                 musQueue[msg.channel.guild.id] = [
                  {
                     "url": "",
                     "title": "",
                     "requester": ""
                  }
                 ];
               }
                 const songAdded = new Discord.RichEmbed()
                  .setTitle('-=-=-=-= Queue Update -=-=-=-=')
                  .setAuthor( sender, msg.author.avatarURL )
                  .setColor(0x00AE86)
                  .setDescription('\n')
                  .setFooter('', '')
                  .setImage( "" )
                  .setThumbnail( info.thumbnail_url )
                  .setTimestamp()
                  .setURL('')
                  .addField('-> New Song Added:', info.title, false)
                  .addField('-> URL:', url, false)
                  .addField('-> Requested By:', sender, false);

                 const queueCompleted = new Discord.RichEmbed()
                  .setTitle('Queue Complete')
                  .setAuthor( bot.user.username, bot.user.avatarURL )
                  .setColor(0x00AE86)
                  .setDescription('\nQueue Complete. **Disconnecting from Voice Channel**')
                  .setFooter('', '')
                  .setImage( "" )
                  .setThumbnail( "" )
                  .setTimestamp()
                  .setURL('');

                 msg.channel.sendEmbed(
                  songAdded,
                  '',
                  { disableEveryone: true }
                 ).then(mesg => {
                setTimeout(function() {
                    mesg.delete();
                }, 15000);
             });

               musQueue[msg.channel.guild.id].push({
                 url: url,
                 title: info.title,
                 requester: sender
               });
            if (musQueue[msg.channel.guild.id].playing) return;
            let dispatcher;
            play(musQueue[msg.guild.id][1], msg);
          });
           } else {
            var opts = {
              maxResults: 5,
              type: 'video',
              key: main.auth["yt-s_key"]
            };
 
            searchYT(msg.content.replace(cmd + "play ", ""), opts, function(err, results) {
              if(err) return msg.channel.sendMessage("Error whilst searching.\n\`\`\`" + err + "\`\`\`");
              var url = results[0].link;

              ytdl.getInfo(url, (err, info) => {
               if (err) {
                return msg.channel.sendMessage("***___" + err + "___***");
               }

               if (typeof musQueue[msg.channel.guild.id] == "undefined") {
                 musQueue[msg.channel.guild.id] = [
                  {
                     "url": "",
                     "title": "",
                     "requester": ""
                  }
                 ];
               }

               const songAdded = new Discord.RichEmbed()
                  .setTitle('-=-=-=-= Queue Update -=-=-=-=')
                  .setAuthor( sender, msg.author.avatarURL )
                  .setColor(0x00AE86)
                  .setDescription('\n')
                  .setFooter('', '')
                  .setImage( "" )
                  .setThumbnail( info.thumbnail_url )
                  .setTimestamp()
                  .setURL('')
                  .addField('-> New Song Added:', info.title, false)
                  .addField('-> URL:', url, false)
                  .addField('-> Requested By:', sender, false);

                 const queueCompleted = new Discord.RichEmbed()
                  .setTitle('Queue Complete')
                  .setAuthor( bot.user.username, bot.user.avatarURL )
                  .setColor(0x00AE86)
                  .setDescription('\nQueue Complete. **Disconnecting from Voice Channel**')
                  .setFooter('', '')
                  .setImage( "" )
                  .setThumbnail( "" )
                  .setTimestamp()
                  .setURL('');

                 msg.channel.sendEmbed(
                  songAdded,
                  '',
                  { disableEveryone: true }
                 ).then(mesg => {
                  setTimeout(function() {
                    mesg.delete();
                  }, 15000);
                });

               musQueue[msg.channel.guild.id].push({
                 url: url,
                 title: info.title,
                 requester: msg.guild.member(msg.author).displayName
               });

               if (musQueue[msg.guild.id].playing) return;
               play(musQueue[msg.guild.id][1], msg);
             });
            });
            return;
        }
}


    function play(song, msg) {
      var cmd = config["prefix_" + msg.channel.guild.id];
      const queueCompleted = new Discord.RichEmbed()
        .setTitle('Queue Complete')
        .setAuthor( bot.user.username, bot.user.avatarURL )
        .setColor(0x00AE86)
        .setDescription('\nQueue Complete. **Disconnecting from Voice Channel**')
        .setFooter('', '')
        .setImage( "" )
        .setThumbnail( "" )
        .setTimestamp()
        .setURL('');

        if (song == undefined || musQueue[msg.guild.id][1] === undefined) return msg.channel.sendEmbed(queueCompleted, '', { disableEveryone: true }).then(() => {
          musQueue[msg.channel.guild.id].playing = false;
          musQueue[msg.channel.guild.id].current = "None";
          bot.voiceConnections.get(msg.guild.id).channel.leave();
          return;
        });

      const stream = ytdl(song.url, {filter : 'audioonly'});
      const streamOptions = { seek: 0, volume: 1 };
      dispatcher = msg.guild.voiceConnection.playStream(stream, streamOptions);

      if (musQueue[msg.guild.id].volume === undefined) {
        musQueue[msg.guild.id].volume = 1;
        dispatcher.setVolume(1);
      } else {
        dispatcher.setVolume(musQueue[msg.guild.id].volume);
      }

      const songPlaying = new Discord.RichEmbed()
      .setTitle('Current Song')
      .setAuthor( bot.user.username, bot.user.avatarURL )
      .setColor(0x00AE86)
      .setDescription('**Playing:** ' + song.title + "\n**URL:** " + song.url + "\n**Requested By:** " + song.requester)
      .setFooter('', '')
      .setImage( "" )
      .setThumbnail( "" )
      .setTimestamp()
      .setURL('');

      const songFinished = new Discord.RichEmbed()
      .setTitle('Finished Song')
      .setAuthor( bot.user.username, bot.user.avatarURL )
      .setColor(0x00AE86)
      .setDescription('**Finished Playing:** ' + song.title + "\n**URL:** " + song.url + "\n**Requested By:** " + song.requester)
      .setFooter('', '')
      .setImage( "" )
      .setThumbnail( "" )
      .setTimestamp()
      .setURL('');

      dispatcher.on('start', () => {
          msg.channel.sendEmbed(songPlaying, '', { disableEveryone: true })
          .then(mesg => {
            setTimeout(function() {
                mesg.delete();
            }, 15000);
          });

          console.log("Music> Playing: " + song.title + " on " + msg.channel.guild.name + ". Requested by " + song.requester + ".");
          musQueue[msg.channel.guild.id].playing = true;
          musQueue[msg.channel.guild.id].current = song.title;
      });
      /*
      dispatcher.on('speaking', (value) => {

      });
    */
      dispatcher.on('end', () => {
        musQueue[msg.channel.guild.id].playing = false;
        musQueue[msg.channel.guild.id].shift();
        collector.stop();
        msg.channel.sendEmbed(songFinished, '', { disableEveryone: true })
        .then(mesg => {
            setTimeout(function() {
                mesg.delete();
            }, 15000);
        });
        console.log("Music> Finished Playing: " + song.title + " on " + msg.channel.guild.name + ". Requested by " + song.requester + ".");
        musQueue[msg.channel.guild.id].current = "None";
        play(musQueue[msg.channel.guild.id][1], msg);
      });

      dispatcher.on('error', (err) => {
        console.error("Music> An error occured on " + msg.channel.guild.name + ". '" + err + "'.");
        msg.reply("An error has occured.\n\`\`\`" + err + "\`\`\`");
        voiceChan.leave();
        console.log(err);
      });

      let collector = msg.channel.createCollector(m => m);
         collector.on('message', m => {
            let sender = "";

            if (m.channel.guild.member(m.author).nickname == null) {
              sender = m.author.username;
            } else {
              sender = m.channel.guild.member(m.author).nickname;
            }

            const pauseEm = new Discord.RichEmbed()
            .setTitle('-=-=-=-= Music Pause -=-=-=-=')
            .setAuthor( m.author.username, m.author.avatarURL )
            .setColor([255, 28, 28])
            .setDescription(`\nCurrently playing music was paused by **${m.author.username}**`)
            .setFooter('', '')
            .setImage( "" )
            .setThumbnail( "" )
            .setTimestamp( '' )
            .setURL('')
            .addField(`\n-> Playing`, `**${musQueue[msg.guild.id].current}`);

            const resumeEm = new Discord.RichEmbed()
            .setTitle('-=-=-=-= Music Resume -=-=-=-=')
            .setAuthor( m.author.username, m.author.avatarURL )
            .setColor([255, 28, 28])
            .setDescription(`\nMusic queue was resumed by **${m.author.username}**`)
            .setFooter('', '')
            .setImage( "" )
            .setThumbnail( "" )
            .setTimestamp( '' )
            .setURL('')
            .addField(`\n-> Playing`, `**${musQueue[msg.guild.id].current}`);

            const skipEm = new Discord.RichEmbed()
            .setTitle('-=-=-=-= Music Skip -=-=-=-=')
            .setAuthor( m.author.username, m.author.avatarURL )
            .setColor([255, 28, 28])
            .setDescription(`\nCurrently playing music was skipped by **${m.author.username}**`)
            .setFooter('', '')
            .setImage( "" )
            .setThumbnail( "" )
            .setTimestamp( '' )
            .setURL('')
            .addField(`\n-> Previously Playing`, `**${musQueue[msg.guild.id].current}`);

               if (m.content.startsWith(cmd + 'pause')) {
                 if (m.guild.roles.find("name", "Staff") == null) {
                       m.reply('```An error has occured\nReason: Role: Staff does not exist. Contact the server owner and get him/her to create it.```')
                       return;
                 }

                 if (!(m.member.roles.has(msg.guild.roles.find("name", "Staff").id))) {
                       m.reply('```You can not run this command\nReason: You are not in the correct permission role [Staff]```');
                       return;
                 }

                    m.delete();
                    msg.channel.sendEmbed(pauseEm, '', { disableEveryone: true })
                    .then(mesg => {
                      setTimeout(function() {
                        mesg.delete();
                      }, 5000);
                    });
                    dispatcher.pause();
               } else if (m.content.startsWith(cmd + 'resume')){
                 if (m.guild.roles.find("name", "Staff") == null) {
                       m.reply('```An error has occured\nReason: Role: Staff does not exist. Contact the server owner and get him/her to create it.```')
                       return;
                 }

                 if (!(m.member.roles.has(msg.guild.roles.find("name", "Staff").id))) {
                       m.reply('```You can not run this command\nReason: You are not in the correct permission role [Staff]```');
                       return;
                 }

                    m.delete();
                    msg.channel.sendEmbed(resumeEm, '', { disableEveryone: true })
                    .then(mesg => {
                      setTimeout(function() {
                        mesg.delete();
                      }, 5000);
                    });
                    dispatcher.resume();
               } else if (m.content.startsWith(cmd + 'skip')){
                 if (m.guild.roles.find("name", "Staff") == null) {
                       m.reply('```An error has occured\nReason: Role: Staff does not exist. Contact the server owner and get him/her to create it.```')
                       return;
                 }

                 if (!(m.member.roles.has(msg.guild.roles.find("name", "Staff").id))) {
                       m.reply('```You can not run this command\nReason: You are not in the correct permission role [Staff]```');
                       return;
                 }
                    m.delete();
                    msg.channel.sendEmbed(skipEm, '', { disableEveryone: true })
                    .then(mesg => {
                      setTimeout(function() {
                        mesg.delete();
                      }, 5000);
                    });
                    dispatcher.end();
               } else if (m.content.startsWith(cmd + 'volume')){
                 if (m.guild.roles.find("name", "Staff") == null) {
                       m.reply('```An error has occured\nReason: Role: Staff does not exist. Contact the server owner and get him/her to create it.```')
                       return;
                 }

                 if (!(m.member.roles.has(msg.guild.roles.find("name", "Staff").id))) {
                       m.reply('```You can not run this command\nReason: You are not in the correct permission role [Staff]```');
                       return;
                 }

                    m.delete();
                    let volume = m.content.replace(cmd + "volume ", '');
                    if (volume > 2) {
                        msg.reply(':musical_note: No. ' + sender + ' just tried to set the volume above 100%.')
                      .then(mesg => {
                        setTimeout(function() {
                          mesg.delete();
                        }, 5000);
                      });
                      return;
                    }
                    dispatcher.setVolume(volume);
                    let volPerc = Math.round(dispatcher.volume*50);

                    const volumeEm = new Discord.RichEmbed()
                      .setTitle('-=-=-=-= Music Volume Change -=-=-=-=')
                      .setAuthor( msg.author.username, msg.author.avatarURL )
                      .setColor([255, 28, 28])
                      .setDescription(`\nCurrently playing music's volume was changed by **${msg.author.username}**`)
                      .setFooter('', '')
                      .setImage( "" )
                      .setThumbnail( "" )
                      .setTimestamp( '' )
                      .setURL('')
                      .addField("-> New Volume:", `**${volume}** (**${volPerc}**)`);

                    msg.channel.sendEmbed(volumeEm, '', { disableEveryone: true })
                    .then(mesg => {
                      setTimeout(function() {
                        mesg.delete();
                      }, 5000);
                    });
                    musQueue[msg.guild.id].volume = volume;
             }
           });
         }