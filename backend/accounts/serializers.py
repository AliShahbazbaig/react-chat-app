from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

user=get_user_model()
class UserSerializer(serializers.ModelSerializer):
    password= serializers.CharField(write_only=True)
    is_online= serializers.BooleanField(read_only=True)
    last_seen= serializers.DateTimeField(read_only=True)

    def create(self,validated_data):
        user=get_user_model().objects.create_user(
            email = validated_data['email'],
            password = validated_data['password'],
            first_name=validated_data.get('first_name',""),
            last_name=validated_data.get('last_name',""),
            image_url=validated_data.get('image_url',""),
            description=validated_data.get('description',""),
        )
        return user
    
    class Meta:
        model = get_user_model()
        fields = ['email','password', 'first_name', 'last_name', 'image_url','description','is_online','last_seen','id']
        extra_kwargs={
            'password': {'write_only':True}
        }

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    id = serializers.CharField(max_length=255,read_only=True)
    password = serializers.CharField(write_only=True)

    first_name= serializers.CharField(max_length=255,read_only=True)
    last_name= serializers.CharField(max_length=255,read_only=True)
    image_url= serializers.CharField(max_length=255,read_only=True)
    description= serializers.CharField(max_length=255,read_only=True)
    is_active= serializers.BooleanField(read_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email is None:
            raise serializers.ValidationError("Email is required")
        if password is None:
            raise serializers.ValidationError("Password is required")
        
        user=authenticate(email=email,password=password)

        if user is None:
            raise serializers.ValidationError("Invalid email or password")
        
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        
        self.context['user']=user
        return user