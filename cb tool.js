(function() {
  if (!window.FA) window.FA = {};
  if (FA.Chat) {
    if (window.console) console.warn('FA.Chat has already been initialized');
    return;
  }

  FA.Chat = {

    // chatbox settings
    config : {
      height : '60%',
      width : '70%',
      
      live_notif : true,
      sound_notif : {
        enabled : false,
        file : 'http://illiweb.com/fa/fdf/zelda.mono.mp3'
      },
      notifRate : 10000
    },

    // language settings
    lang : {
      chatbox : 'Chatbox',
      new_msg : 'Nuevo mensaje en la <a href="javascript:FA.Chat.toggle();">Chatbox</a>.'
    },

    // technical data below
    node : {}, // node cache
    users : 0, // users in chat
    messages : 'initial', // total chat messages
    actif : false, // tells us if the chatbox is opened
    notifActif : false, // tells us if the notifications are active

    // initial setup of the chatbox
    init : function() {
      var right = document.getElementById('fa_right'),
          container = document.createElement('DIV'),
          button = document.createElement('A'),
          audio;

      button.id = 'fa_chat_button';
      button.innerHTML = FA.Chat.lang.chatbox + ' <span id="fa_chatters">(0)</span>';
      button.onclick = FA.Chat.toggle;
      FA.Chat.node.button = button;

      container.id = 'fa_chat_container';
      container.innerHTML = '<iframe id="fa_chat" src="/chatbox"></iframe>';
      container.style.width = FA.Chat.config.width;
      container.style.height = FA.Chat.config.height;
      container.style.bottom = '-' + FA.Chat.config.height;
      container.style.visibility = 'hidden';

      if (right) {
        right.insertBefore(button, right.lastChild); // add the chat button to the right side of the toolbar
        document.body.appendChild(container);
        
        // create the notification audio element
        if (FA.Chat.config.sound_notif.enabled) {
          audio = document.createElement('AUDIO');
          audio.src = FA.Chat.config.sound_notif.file;
          if (audio.canPlayType) {
            FA.Chat.node.audio = audio;
            document.body.appendChild(audio);
          }
        }

        FA.Chat.node.container = document.getElementById('fa_chat_container');
        FA.Chat.node.chatters = document.getElementById('fa_chatters');
        FA.Chat.node.frame = document.getElementById('fa_chat');
        FA.Chat.node.frame.onload = FA.Chat.getFrame;
      }
      
      delete FA.Chat.init;
    },

    // get the frame window, document, and elements
    getFrame : function() {
      if (FA.Chat.poll) window.clearInterval(FA.Chat.poll);
      if (this.contentDocument || this.contentWindow) {
        FA.Chat.window = this.contentWindow;
        FA.Chat.document = this.contentDocument ? this.contentDocument : FA.Chat.window.document;
        
        FA.Chat.node.message = FA.Chat.document.getElementById('message');
        FA.Chat.node.members = FA.Chat.document.getElementById('chatbox_members');
        
        FA.Chat.poll = window.setInterval(FA.Chat.listen, 300); // listen for changes every 0.3 seconds
      }
    },
    
    // listen for changes in the chatbox
    listen : function() {
      var users = FA.Chat.node.members.getElementsByTagName('LI').length,
          messages = FA.Chat.window.chatbox.messages.length;
      
      // update user count
      if (users > FA.Chat.users || users < FA.Chat.users) {
        FA.Chat.users = users;
        FA.Chat.node.chatters.innerHTML = '(' + FA.Chat.users + ')';
      }
      
      // initial / active updates
      if ((FA.Chat.messages == 'initial' && messages) || FA.Chat.notifActif || FA.Chat.actif) FA.Chat.messages = messages;
      
      // notify new messages while connected and the chatbox is closed
      if (!FA.Chat.actif && !FA.Chat.notifActif && FA.Chat.window.chatbox.connected && (messages > FA.Chat.messages || messages < FA.Chat.messages)) {
        FA.Chat.messages = messages; // update message count
        FA.Chat.notifActif = true;
        
        if (FA.Chat.config.live_notif) FA.Chat.notify(FA.Chat.lang.new_msg); // show live notification
        if (FA.Chat.config.sound_notif.enabled && FA.Chat.node.audio) FA.Chat.node.audio.play(); // play sound notification
        
        // wait before notifying the user again
        window.setTimeout(function() {
          FA.Chat.notifActif = false;
        }, FA.Chat.config.notifRate);
      }
    },
    
    // create a custom notification
    notify : function(msg) {
      
      var notif = document.createElement('DIV'),
          live = document.getElementById(Toolbar.LIVE_NOTIF);
          
      notif.className = 'fa_notification';
      notif.innerHTML = '<div class="content ellipsis">' + msg + '</div>';
      notif.style.display = 'none';
      
      $(notif).mouseover(function() { $(this).stop(true, true) });
      $(notif).mouseleave(function() { $(this).delay(5000).fadeOut() });
      
      live.insertBefore(notif, live.firstChild);
      $(notif.firstChild).dotdotdot();
      
      $(notif).fadeIn(100, function() { $(this).delay(10000).fadeOut() });
    },
    
    // toggle the display state of the chatbox
    toggle : function() {
      var container = FA.Chat.node.container.style;
        
      if (/hidden/i.test(container.visibility)) {
        FA.Chat.node.button.className = 'fa_chat_active';
        FA.Chat.actif = true;
          
        container.visibility = 'visible';
        container.bottom = '3px';
          
        // auto focus the message field
        window.setTimeout(function() {
          FA.Chat.node.message.focus();
        }, 350); // some browsers ( firefox ) need a delay
      } else {
        FA.Chat.node.button.className = '';
        FA.Chat.actif = false;
          
        container.visibility = 'hidden';
        container.bottom = '-' + FA.Chat.config.height;
      }
    }

  };

  $(function(){
    // initialize the chat when the document is ready and the user is logged in
    if (_userdata.session_logged_in) $(FA.Chat.init);
  });
})();