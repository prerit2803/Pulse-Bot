package selenium.tests;

import static org.junit.Assert.*;

import java.io.IOException;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import io.github.bonigarcia.wdm.ChromeDriverManager;

public class CollaboratorTest {

	private static WebDriver driver;
	private static String password=System.getenv("password");
	private static String buggyUser="mbehroo";
	private static String serverAddress = "http://13.59.112.43:3000";
	private static CloseableHttpClient httpClient = HttpClientBuilder.create().build();
	
	@Before	//runs before each test
	public void setUp() throws Exception 
	{
		//driver = new HtmlUnitDriver();
		ChromeDriverManager.getInstance().setup();
		driver = new ChromeDriver();
	}
	
	@After //runs after each test
	public void  tearDown() throws Exception
	{
		driver.close();
		driver.quit();
	}
	
	@AfterClass // runs after testSuite
	public static void cleanUp() throws Exception{
		HttpPost httpPost = new HttpPost(serverAddress + "/successBuild");
		StringEntity params = new StringEntity("{\"commitID\":\"34fc1208c7b241f81b128996ca3f52cb2429cfc3\","
				+ "\"AuthorName\":\"AuthorName\", "
				+ "\"source\":\"SeleniumTest\"} ");
		httpPost.setEntity(params);
		httpPost.setHeader("Content-type", "application/json");
		httpClient.execute(httpPost);
	}
	
	@Test
	public void testUserRemoved() throws ClientProtocolException, IOException {
		
		driver.get("https://github.ncsu.edu/pulseBotProject/MavenVoid");

		// Wait until page loads and we can see a sign in button.
		WebDriverWait wait = new WebDriverWait(driver, 30);
		
		// Find email and password fields.
		WebElement username = driver.findElement(By.xpath("//input[@name='login']"));
		WebElement pw = driver.findElement(By.xpath("//input[@name='password']"));
		// Type in our user login info.
		username.sendKeys("asaxena3");
		pw.sendKeys(password);
		// Click
		WebElement signin = driver.findElement(By.xpath("//input[@name='commit']"));
		signin.click();

		// Wait until we go to MavenVoid repository page.
		wait.until(ExpectedConditions.titleContains("MavenVoid"));
		// Click the settings tab to check collaborators.
		WebElement setting=driver.findElement(By.xpath("//a[contains(@href,'MavenVoid/setting')]"));
		setting.click(); 		
		// Wait until collaborator option is clickable.
		wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//a[contains(.,'Collaborators & teams')]")));
		WebElement collaborator=driver.findElement(By.xpath("//a[contains(.,'Collaborators & teams')]"));
		// Click collaborator tab
		collaborator.click();
		// Add buggyUser to as a collaborator
		wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@id='search-member']")));
		WebElement inputBox=driver.findElement(By.xpath("//input[@id='search-member']"));
		inputBox.sendKeys(buggyUser);
		inputBox.submit();
		
		// Assert if user has been added
		String commiterXpath="//a[@href='/"+ buggyUser +"']";
		List<WebElement> commiter=driver.findElements(By.xpath(commiterXpath));
		//System.out.println(commiter.size());	
		assertEquals(commiter.size(),1) ; //user added successfully!
		
		//send 6 http request mocking 6 buggy commits
		sendHTTPrequest(6);
		
		//wait until collaborator list loads
		driver.navigate().refresh();
		wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//div[@id='collaborators']")));
		
		//check collaborator
		commiterXpath="//a[@href='/"+ buggyUser +"']";
		commiter=driver.findElements(By.xpath(commiterXpath));
		assertEquals(commiter.size(),0) ;	//user removed successfully!
		
	}

	
	@Test
	public void testUserNotRemoved() throws ClientProtocolException, IOException {
		
		driver.get("https://github.ncsu.edu/pulseBotProject/MavenVoid");

		// Wait until page loads and we can see a sign in button.
		WebDriverWait wait = new WebDriverWait(driver, 30);
		
		// Find email and password fields.
		WebElement username = driver.findElement(By.xpath("//input[@name='login']"));
		WebElement pw = driver.findElement(By.xpath("//input[@name='password']"));
		// Type in our user login info.
		username.sendKeys("asaxena3");
		pw.sendKeys(password);
		// Click
		WebElement signin = driver.findElement(By.xpath("//input[@name='commit']"));
		signin.click();

		// Wait until we go to MavenVoid repository page.
		wait.until(ExpectedConditions.titleContains("MavenVoid"));
		// Click the settings tab to check collaborators.
		WebElement setting=driver.findElement(By.xpath("//a[contains(@href,'MavenVoid/setting')]"));
		setting.click(); 		
		// Wait until collaborator option is clickable.
		wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//a[contains(.,'Collaborators & teams')]")));
		WebElement collaborator=driver.findElement(By.xpath("//a[contains(.,'Collaborators & teams')]"));
		// Click collaborator tab
		collaborator.click();
		// Add buggyUser to as a collaborator
		wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@id='search-member']")));
		WebElement inputBox=driver.findElement(By.xpath("//input[@id='search-member']"));
		inputBox.sendKeys(buggyUser);
		inputBox.submit();
		
		// Assert if user has been added
		String commiterXpath="//a[@href='/"+ buggyUser +"']";
		List<WebElement> commiter=driver.findElements(By.xpath(commiterXpath));
		//System.out.println(commiter.size());	
		assertEquals(commiter.size(),1) ; //user added successfully!
		
		//send 5 http request mocking buggy count less than the maxBuggyCount per day
		sendHTTPrequest(5);
		
		//wait until collaborator list loads
		driver.navigate().refresh();
		wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//div[@id='collaborators']")));
		
		//check collaborator
		commiterXpath="//a[@href='/"+ buggyUser +"']";
		commiter=driver.findElements(By.xpath(commiterXpath));	
		assertEquals(commiter.size(),1) ;	//user not removed
		
	}
	
	private void sendHTTPrequest(int commits) throws ClientProtocolException, IOException {
		while(commits-- !=0) {
			CloseableHttpClient httpClient = HttpClientBuilder.create().build();
			HttpPost httpPost = new HttpPost("http://13.59.112.43:3000/failBuild");
			StringEntity params =new StringEntity("{\"commitID\":\"commitID\",\"AuthorName\":\"mbehroo\",\"source\":\"SeleniumTest\"} ");
			httpPost.setEntity(params);
			httpPost.setHeader("Content-type", "application/json");
			HttpResponse response = httpClient.execute(httpPost);
		}
	}
}
