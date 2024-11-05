package com.mcmasterbaja;

import static io.restassured.RestAssured.given;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

// import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
class GreetingResourceTest {
  @Test
  void testHelloEndpoint() {
    given().when().get("/files").then().statusCode(200);
    //  .body(is("Hello from Quarkus REST"));
  }
}
