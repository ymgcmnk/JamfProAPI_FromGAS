/**
 * 1. Create a user account with the required privileges from the Jamf Pro console. Please make a note of your username and password.
 * 2. Set the following values in the script properties; username, password and Base URL
 * 
 * Base URL
 * http://yourserver.jamfcloud.com/api/v1/
 * 
 * Properties Service
 * https://developers.google.com/apps-script/guides/properties?hl=en
 * 
 * 3. Execute the getTokenViaBasicAuth function only the first time to get the first token.
 * 4. Finally, run the getComputersInventory function.
 */

function getTokenViaBasicAuth() {
  const url = PropertiesService.getScriptProperties().getProperty("url")

  const username = PropertiesService.getScriptProperties().getProperty("username")
  const password = PropertiesService.getScriptProperties().getProperty("password")

  // ClassicAPIはBasic認証なのでCredentialをBase64エンコードする
  // username:passwordはAPIアクセス用のJamfアカウントを作成し指定する
  const auth_data = Utilities.base64Encode(`${username}:${password}`)

  const response = UrlFetchApp.fetch(url + 'auth/token',
    {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + auth_data }  //Basicのあとは半角スペース必要
    });

  const obj = JSON.parse(response.getContentText())
  const token = obj.token

  PropertiesService.getScriptProperties().setProperty("token", token)

  const test = PropertiesService.getScriptProperties().getProperty("token")
  console.log(test)
}


/**
 * tokenRefresh
 * @return {string} newToken
 */
function tokenRefresh() {
  const token_value = PropertiesService.getScriptProperties().getProperty("token")

  const url = PropertiesService.getScriptProperties().getProperty("url")
  // console.log(url)
  // return
  const response = UrlFetchApp.fetch(url + 'auth/keep-alive',
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token_value,
        'Accept': 'application/json'
      }
      //Bearerのあとは半角スペース必要
    });

  const obj = JSON.parse(response.getContentText())
  const newToken = obj.token

  PropertiesService.getScriptProperties().setProperty("token", newToken)
  console.log(newToken)
  return newToken
}


/**
 * https://developer.jamf.com/jamf-pro/reference/get_v1-computers-inventory
 */
function getComputersInventory() {
  const token_value = tokenRefresh()
  const url = PropertiesService.getScriptProperties().getProperty("url")
  const response = UrlFetchApp.fetch(url + '/computers-inventory?section=GENERAL&page=0&page-size=100&sort=id%3Aasc',
    {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token_value,       //Bearerのあとは半角スペース必要
        'Accept': 'application/json'
      }
    });
  const obj = JSON.parse(response.getContentText())
  console.log(obj)
}