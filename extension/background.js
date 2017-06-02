class TwitchLive {

  constructor() {

    /**
     * Le CLIENT-ID de l'application pour utiliser l'API de Twitch.
     * @type {Array.<String>}
     */
    this.CLIENT_IDS = [
      '4ingm92octqebeguewbcniphqvsicz2',
      '5vbg8jh8fpjivpoymm9nuu0ry36vb6',
      'qdilx7s3a81837a2lkldmbmhvbx9le',
      'ux32jomga3mjocabrfn59sdgqozbla'
    ];

    /**
     * L'URL a appeler pour avoir les infos sur un stream.
     * @type {string}
     */
    this.API_URL_STREAM = 'https://api.twitch.tv/kraken/streams/?channel=113511896';

    /**
     * L'URL du stream Twitch.
     * @type {string}
     */
    this.URL_STREAM = 'https://www.twitch.tv/chap_gg';

    /**
     * @type {Boolean|null}
     */
    this.isOnline = null;

    this.setupBadgeBehavior();
    this.setUpNotificationsBehavior();
    this.updateStreamState();
  }

  /**
   * Configure le comportement du badge.
   */
  setupBadgeBehavior() {
    chrome.browserAction.onClicked.addListener(_ => this._openStream())
  }

  /**
   * Configure le comportement des notifications.
   */
  setUpNotificationsBehavior() {
    chrome.notifications.onClicked.addListener(_ => this._openStream());
  }

  /**
   * Ouvre la page du stream Twitch dans un nouvel onglet.
   * @private
   */
  _openStream() {
    chrome.tabs.create({active: true, url: this.URL_STREAM})
  }

  /**
   * Met à jour l'état en-ligne/hors-ligne d'un stream en particulier, en appelant l'API Twitch.
   */
  updateStreamState() {
    const clientId = this.CLIENT_IDS[Math.floor(Math.random() * this.CLIENT_IDS.length)];
    const headers = {
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Client-ID': clientId
    };

    // Connexion à l'API de Twitch
    fetch(this.API_URL_STREAM, {headers})
      .then(response => {
        if(response.ok) {
          response.json().then(json => this.handleResponse(json))
        } else {
          console.error(new Date(), "Mauvaise réponse du réseau");
        }
      })
      .catch(error => {
        console.error(new Date(), "Erreur avec la fonction fetch()", error)
      });

    this.prepareNextUpdate();
  }

  /**
   * Traite les données issues d'une requête à l'API Twitch.
   * @param {Object} json Les données en JSON retournées par l'API Twitch
   */
  handleResponse(json) {
    let isOnline = json['streams'].length > 0;

    if (this.isOnline === false && isOnline === true) {
      chrome.notifications.create('chap_gg', {
        type: 'basic',
        iconUrl: '../icons/icon_128.png',
        title: 'Chap est actuellement en live !',
        message: json['streams'][0]['channel']['status'].trim()
      });
    }

    isOnline ? this.showStreamerOnline() : this.showStreamerOffline();
    this.isOnline = isOnline;
  }

  /**
   * Prépare la prochaine mise à jour de l'état du stream.
   */
  prepareNextUpdate() {
    // Entre 1 et 3 minutes
    const timeToWaitBeforeNextUpdate = (Math.random() * 2 + 1) * 60 * 1000;
    setTimeout(_ => this.updateStreamState(), timeToWaitBeforeNextUpdate)
  }

  /**
   * Affiche le streamer en-ligne.
   */
  showStreamerOnline() {
    chrome.browserAction.setBadgeText({text: 'ON'});
    chrome.browserAction.setBadgeBackgroundColor({color: 'green'})
  }

  /**
   * Affiche le streamer hors-ligne.
   */
  showStreamerOffline() {
    chrome.browserAction.setBadgeText({text: 'OFF'});
    chrome.browserAction.setBadgeBackgroundColor({color: 'gray'})
  }
}

window.TwitchLive = new TwitchLive();
