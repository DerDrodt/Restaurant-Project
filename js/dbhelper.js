/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    if(!navigator.onLine || navigator.connection.downlink < .5)
      return DBHelper.getRestaurantsFromIDB();
    return fetch(DBHelper.DATABASE_URL + 'restaurants')
      .then(res => res.json())
      .then(data => {
        DBHelper.saveRestaurantsToIDB(data);
        return Promise.resolve(data);
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id) {
    if(!navigator.onLine || navigator.connection.downlink < .5)
      return DBHelper.getRestaurantFromIDB(id);
    return fetch(`${DBHelper.DATABASE_URL}restaurants/${id}`)
      .then(res => res.json())
      .then(data => {
        DBHelper.saveRestaurantToIDB(data);
        return Promise.resolve(data);
      });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine) {
    // Fetch all restaurants  with proper error handling
    return DBHelper.fetchRestaurants()
      .then(res => res.filter(r => r.cuisine_type == cuisine));
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood) {
    return DBHelper.fetchRestaurants()
      .then(res => res.filter(r => r.neighborhood == neighborhood));
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    return DBHelper.fetchRestaurants()
      .then(res => {
        if (cuisine != 'all') { // filter by cuisine
          res = res.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          res = res.filter(r => r.neighborhood == neighborhood);
        }
        return res;
      });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods() {
    return DBHelper.fetchRestaurants()
      .then(res => {
        // Get all neighborhoods from all restaurants
        const neighborhoods = res.map((v, i) => res[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        return uniqueNeighborhoods;
      });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    return DBHelper.fetchRestaurants()
      .then(res => {
        // Get all cuisines from all restaurants
        const cuisines = res.map((v, i) => res[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        return uniqueCuisines;
      });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph || restaurant.id}_800w.jpg`);
  }

  static imageSrcSetForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph || restaurant.id}_300w.jpg 300w,
            /img/${restaurant.photograph || restaurant.id}_600w.jpg 600w,
            /img/${restaurant.photograph || restaurant.id}_800w.jpg 800w`);
  }

  static imageSizesForRestaurant(restaurant) {
    return (`(max-width: 639px) 100vw, 300px`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    }
    );
    return marker;
  }

  static saveRestaurantsToIDB(data) {
    return idbKeyval.set('restaurants', data);
  }

  static saveRestaurantToIDB(data) {
    return this.getRestaurantsFromIDB()
    .then(res => {
      if(res.filter(r => r.id === data.id).length === 0) {
        DBHelper.saveRestaurantsToIDB([...res, data]);
      }
    })
    .catch(() => this.saveRestaurantsToIDB([data]));
  }

  static getRestaurantsFromIDB() {
    console.log('Loading from IDB!');
    return idbKeyval.get('restaurants');
  }

  static getRestaurantFromIDB(id) {
    return DBHelper.getRestaurantsFromIDB()
      .then(res => res.filter(r => r.id === id)[0])
  }

}
