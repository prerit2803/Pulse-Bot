package selenium.tests;

import static org.junit.Assert.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import io.github.bonigarcia.wdm.ChromeDriverManager;

public class RedisTest
{
	private static WebDriver driver;
	
	private static String user = "pbhanda2@ncsu.edu";
	private static String pass = "QWE!@#qwe123";
	private static CloseableHttpClient httpClient = HttpClientBuilder.create().build();
	private static String serverAddress = "http://13.59.112.43:3000";
	
	@Before // runs before every testCase
	public void setUp() throws Exception 
	{
		ChromeDriverManager.getInstance().setup();
		driver = new ChromeDriver();
	}
	
	@After // runs after every testCase
	public void tearDown() throws Exception
	{
		driver.close();
		driver.quit();
	}
	
	@AfterClass // runs after testSuite
	public static void cleanUp() throws Exception{	
		CloseableHttpClient httpClient = HttpClientBuilder.create().build();
		HttpPost httpPost = new HttpPost(serverAddress + "/successBuild");
		StringEntity params = new StringEntity("{\"commitID\":\"34fc1208c7b241f81b128996ca3f52cb2429cfc2\","
				+ "\"AuthorName\":\"AuthorName\", "
				+ "\"source\":\"SeleniumTest\"} ");
		httpPost.setEntity(params);
		httpPost.setHeader("Content-type", "application/json");
		httpClient.execute(httpPost);
		httpClient.close();
	}
	public void pause(Integer milliseconds){
	    try {
	        TimeUnit.MILLISECONDS.sleep(4000);
	    } catch (InterruptedException e) {
	        e.printStackTrace();
	    }
	}
	@Test
	public void redisTest(){
		alternatePath();
		buildSuccess();
		buildFail();
	}
	public void alternatePath(){
		driver.get("https://pulsebot-project.slack.com/");

		// Wait until page loads and we can see a sign in button.
		WebDriverWait wait = new WebDriverWait(driver, 30);
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("signin_btn")));

		// Find email and password fields.
		WebElement email = driver.findElement(By.id("email"));
		WebElement pw = driver.findElement(By.id("password"));

		// Enter our email and password
		// If running this from Eclipse, you should specify these variables in the run configurations.
		email.sendKeys(user);
		pw.sendKeys(pass);

		// Click
		WebElement signin = driver.findElement(By.id("signin_btn"));
		signin.click();

		// Wait until we go to general channel.
		wait.until(ExpectedConditions.titleContains("general"));

		// ~~~~~~~~~~~~~~~~Switch to #selenium-bot channel and wait for it to load.
		driver.get("https://pulsebot-project.slack.com/messages/D7EM5R2HX/");
		wait.until(ExpectedConditions.titleContains("pulsebot"));

		WebElement messageBot = driver.findElement(By.id("msg_input"));
		assertNotNull(messageBot);
			
		Actions actions = new Actions(driver);
		actions.moveToElement(messageBot);
		actions.click();
		actions.sendKeys("repo health");
		actions.sendKeys(Keys.RETURN);
		actions.build().perform();
		
		pause(4000);
		List <WebElement> msg = driver.findElements(	
		     By.xpath("//span[.='Enter GitHubID starting with # (no spaces)']"));
			
			assertNotNull(msg);
			String result = msg.get(msg.size()-1).getText();
      		assertEquals(result,"Enter GitHubID starting with # (no spaces)");
      		
      		actions.moveToElement(messageBot);
    		actions.click();
    		actions.sendKeys("#AuthorName");
    		actions.sendKeys(Keys.RETURN);
    		actions.build().perform();
    		
    		pause(4000);
    		
    		List <WebElement> reply = driver.findElements(		
    		     By.xpath("//span[contains(.,'Github ID')]"));
    		assertNotNull(reply);
    		String check = reply.get(reply.size()-1).getText();
      		assertEquals(check,"Github ID: AuthorName");
      		
      		actions.moveToElement(messageBot);
    		actions.click();
    		actions.sendKeys("repo health");
    		actions.sendKeys(Keys.RETURN);
    		actions.build().perform();
    		
    		pause(4000);
    		
		List <WebElement> response = driver.findElements(	
		     By.xpath("//span[contains(.,'Your bad commits for the day:')]"));
		assertNotNull(response);
		String repoHealthStatus = response.get(response.size()-1).getText();
		String[] parts = repoHealthStatus.split("\n");
		char valueOfBadCommit = parts[0].charAt(parts[0].length()-1);
		String[] branch = parts[1].split(" ");
		String branchName = branch[3];
		
		assertEquals(valueOfBadCommit, '0');
		assertEquals(branchName, "master");
		assertEquals(parts.length, 3);
	}
	public void buildSuccess()
	{
		HttpPost httpPost = new HttpPost(serverAddress + "/successBuild");
		StringEntity params;
		try {
			params = new StringEntity("{\"commitID\":\"34fc1208c7b241f81b128996ca3f52cb2429cfc3\","
					+ "\"AuthorName\":\"AuthorName\", "
					+ "\"source\":\"SeleniumTest\"} ");
			httpPost.setEntity(params);
			httpPost.setHeader("Content-type", "application/json");
			httpClient.execute(httpPost);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		WebElement messageBot = driver.findElement(By.id("msg_input"));
		assertNotNull(messageBot);
			
		Actions actions = new Actions(driver);
		actions.moveToElement(messageBot);
		actions.click();
		actions.sendKeys("repo health");
		actions.sendKeys(Keys.RETURN);
		actions.build().perform();


		pause(4000);
		
    		
    		List <WebElement> response = driver.findElements(		
    		     By.xpath("//span[contains(.,'Your bad commits for the day:')]"));
    		assertNotNull(response);
    		String repoHealthStatus = response.get(response.size()-1).getText();
    		String[] parts = repoHealthStatus.split("\n");
    		char valueOfBadCommit = parts[0].charAt(parts[0].length()-1);
    		String[] branch = parts[1].split(" ");
    		String branchName = branch[3];
    		char authorCommits = parts[3].charAt(parts[3].length()-1);
    		
    		assertEquals(valueOfBadCommit, '0');
    		assertEquals(authorCommits, '1');
    		assertEquals(branchName, "master");
	}
	public void buildFail()
	{
		HttpPost httpPost = new HttpPost(serverAddress + "/failBuild");
		StringEntity params;
		try {
			params = new StringEntity("{\"commitID\":\"34fc1208c7b241f81b128996ca3f52cb2429cfc4\","
					+ "\"AuthorName\":\"AuthorName\", "
					+ "\"source\":\"SeleniumTest\"} ");
			httpPost.setEntity(params);
			httpPost.setHeader("Content-type", "application/json");
			httpClient.execute(httpPost);
		} catch (Exception e) {
			e.printStackTrace();
		}

		WebElement messageBot = driver.findElement(By.id("msg_input"));
		assertNotNull(messageBot);
			
		Actions actions = new Actions(driver);
		actions.moveToElement(messageBot);
		actions.click();
		actions.sendKeys("repo health");
		actions.sendKeys(Keys.RETURN);
		actions.build().perform();


		pause(4000);
		
    		List <WebElement> response = driver.findElements(		
    		     By.xpath("//span[contains(.,'Your bad commits for the day:')]"));
    		assertNotNull(response);
    		String repoHealthStatus = response.get(response.size()-1).getText();
    		String[] parts = repoHealthStatus.split("\n");
    		char valueOfBadCommit = parts[0].charAt(parts[0].length()-1);
    		String[] branch = parts[1].split(" ");
    		String branchName = branch[3];
    		char authorCommits = parts[3].charAt(parts[3].length()-1);
    		
    		assertEquals(valueOfBadCommit, '1');
    		assertEquals(authorCommits, '2');
    		assertTrue(branchName.contains("testStable"));
	}
}
	

