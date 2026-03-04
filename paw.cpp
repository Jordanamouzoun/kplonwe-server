/*
** EPITECH PROJECT, 2026
** paw
** File description:
** 
*/

#include <Servo.h>
#include <vector>

class paw{
private:
    int pin1;
    int pin2;
    int pin3;

    int angle1;
    int angle2;
    int angle3;
    
    Servo _monservo1;
    Servo _monservo2;
    Servo _monservo3;
public:
    paw(int a, int b, int c){
        pin1 = a;
        pin2 = b;
        pin3 = c;
        angle1 = 90;
        angle2 = 135;
        angle3 = 45;
    }
    
    void toAngle(int now, int after, float speed, Servo &servo) {
        int pos;
        if (now <= after) {
            for (pos = now; pos <= after; pos += 1) {
            servo.write(pos);
            delay(speed);
        }
	  } else {
		  for (pos = now; pos >= after; pos -= 1) {
		    servo.write(pos);
		    delay(speed);
		  }
	  }
    }

    void change_angle(int a1, int a2, int a3){
    	toAngle(angle1, a1, 15, _monservo1);
        toAngle(angle2, a2, 15, _monservo2);
        toAngle(angle3, a3, 15, _monservo3);
        angle1 = a1;
        angle2 = a2;
        angle3 = a3;
    }
};

class spiderbot{
private:
    std::vector<paw> paws;
public:
    spiderbot(){}
    spiderbot(std::vector<paw> p) {
        paws = p;
    }
    void addPaw(paw p) {
        paws.push_back(p);
    }
    std::vector<paw> getPaws() const {
        return paws;
    }
};
