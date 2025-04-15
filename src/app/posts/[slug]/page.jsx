
import styles from './singlePage.module.css'
import Image from 'next/image'
import Comments from '@/components/comments/Comments'
import EditPost from '@/components/editPost/EditPost'
import { getAuthSession } from "@/utils/auth"
import Menu from '@/components/Menu/Menu'

const getData = async (slug) => {
  const res = await fetch(`http://localhost:3000/api/posts/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};

const SinglePage = async ({ params }) => {
  const { slug } = params;
  const data = await getData(slug);
  const session = await getAuthSession();
  
  // Check if current user is the author of the post
  const isAuthor = session?.user?.email === data?.user?.email;

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>
            {data?.title}
          </h1>
          <div className={styles.user}>
            {data?.user?.image && <div className={styles.userImageContainer}>
              <Image src={data.user.image} alt="" fill className={styles.image} />
            </div>}
            <div className={styles.userTextContainer}>
              <span className={styles.username}>{data?.user.name}</span>
              <span className={styles.date}>04.14.2025</span>
            </div>
          </div>
        </div>
        {data?.img && <div className={styles.imageContainer}>
          <Image src={data?.img} alt="" fill className={styles.image} />
        </div>}
      </div>
      <div className={styles.content}>
        <div className={styles.post}>
          {/* Show edit button only if current user is the author */}
          {isAuthor && <EditPost post={data} slug={slug} />}
          
          <div className={styles.description} dangerouslySetInnerHTML={{ __html: data?.desc ?? '' }} />
          <div className={styles.comment}>
            <Comments postSlug={slug} />
          </div>
        </div>
        <Menu />
      </div>
    </div>
  )
}

export default SinglePage